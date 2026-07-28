#nullable disable
using System;
using Npgsql;

namespace UyumsoftETL
{
    public class DatabaseManager
    {
        private readonly string _connectionString;

        public DatabaseManager(string connectionString)
        {
            // Tırnak işaretlerini temizle
            if (!string.IsNullOrEmpty(connectionString) && connectionString.StartsWith("\""))
            {
                _connectionString = connectionString.Trim('"');
            }
            else
            {
                _connectionString = connectionString;
            }
        }

        public NpgsqlConnection GetConnection()
        {
            return new NpgsqlConnection(_connectionString);
        }
    }
}