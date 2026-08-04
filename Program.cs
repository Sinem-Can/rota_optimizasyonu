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

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseCors("AllowAll"); // CORS'u aktif et
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "VRP API v1");
    c.RoutePrefix = string.Empty; // Uygulama açılır açılmaz Swagger arayüzü gelsin
});

// API Uçları (Controllers'a Yönlendir)
app.MapControllers();

// Uygulamayı Başlat (Port 5000'e sabitle)
app.Run("http://localhost:5000");
