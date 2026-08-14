using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using DotNetEnv;
using Uyumsoft.RouteOptimizer;

// 1. .env dosyasını yükle
Env.TraversePath().Load();

var builder = WebApplication.CreateBuilder(args);
var apiUrl = builder.Configuration["ASPNETCORE_URLS"] ?? "http://localhost:5100";
builder.WebHost.UseUrls(apiUrl);

// Add Swagger and Controllers
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS services
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        b =>
        {
            b.AllowAnyOrigin()
             .AllowAnyMethod()
             .AllowAnyHeader();
        });
});

// ==========================================
// YENİ EKLENEN KISIM: Veritabanı Bağlantısı
// ==========================================
// .env dosyasındaki bağlantı dizesini çekiyoruz. 
// (Eğer .env dosyasındaki değişken adı farklıysa "DB_CONNECTION_STRING" kısmını ona göre değiştirin)
string dbConnectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING")
                            ?? Environment.GetEnvironmentVariable("DATABASE_URL")
                            ?? "Host=localhost;Database=UyumsoftERP;Username=postgres;Password=1234";

// Railway PostgreSQL bağlantı bilgisini postgres:// URI biçiminde sağlar.
// Npgsql ise anahtar-değer biçiminde bir connection string beklediği için,
// canlı ortamda URI geldiğinde bunu güvenli biçimde dönüştürüyoruz.
if (Uri.TryCreate(dbConnectionString, UriKind.Absolute, out var databaseUri)
    && (databaseUri.Scheme == "postgres" || databaseUri.Scheme == "postgresql"))
{
    var userInfo = databaseUri.UserInfo.Split(':', 2);
    var databaseName = databaseUri.AbsolutePath.Trim('/');
    var port = databaseUri.IsDefaultPort ? 5432 : databaseUri.Port;

    dbConnectionString = $"Host={databaseUri.Host};Port={port};Database={databaseName};" +
                         $"Username={Uri.UnescapeDataString(userInfo[0])};" +
                         $"Password={Uri.UnescapeDataString(userInfo.Length > 1 ? userInfo[1] : string.Empty)};" +
                         "SSL Mode=Require;Trust Server Certificate=true";
}

builder.Services.AddScoped<DatabaseManager>(provider => new DatabaseManager(dbConnectionString));
// ==========================================

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseCors("AllowAll"); // CORS'u aktif et
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "VRP API v1");
    c.RoutePrefix = string.Empty; // Uygulama açılır açılmaz Swagger arayüzü gelsin
});

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

// API Uçları (Controllers'a Yönlendir)
app.MapControllers();

// ASPNETCORE_URLS verilmezse API yerelde 5100 portunda çalışır.
app.Run();
