using Microsoft.AspNetCore.Mvc;
using Uyumsoft.RouteOptimizer.Models;

namespace Uyumsoft.RouteOptimizer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ErpController : ControllerBase
    {
        private readonly DatabaseManager _dbManager;

        // Projenizdeki mevcut DatabaseManager'ı Controller'a bağlıyoruz
        public ErpController(DatabaseManager dbManager)
        {
            _dbManager = dbManager;
        }

        [HttpGet("liste")]
        public IActionResult GetList()
        {
            var veriler = _dbManager.GetFaturaVeIrsaliyeler();
            return Ok(veriler);
        }

        [HttpPost("kes")]
        public IActionResult FaturaKes([FromBody] YeniFaturaIstegi istek)
        {
            _dbManager.FaturaKesVeKaydet(
                istek.IrsaliyeNo, 
                istek.CariAdi, 
                istek.AracPlaka, 
                istek.CikisDeposu, 
                istek.KalemSayisi
            );
            return Ok(new { mesaj = "İrsaliye başarıyla oluşturuldu." });
        }
    }
}