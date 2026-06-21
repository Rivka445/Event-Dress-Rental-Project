using DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Distributed;
using Services;
using System.Text.Json;

namespace EventDressRental.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly HttpClient _http;
        private readonly IModelService _modelService;
        private readonly IDistributedCache _cache;
        private const string CacheKey = "product_list";

        public ChatController(IHttpClientFactory factory, IModelService modelService, IDistributedCache cache)
        {
            _http = factory.CreateClient();
            _modelService = modelService;
            _cache = cache;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ChatRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Message))
                return BadRequest("Message cannot be empty");
            if (req.Message.Length > 1000)
                return BadRequest("Message too long");
            var productList = await GetProductListAsync();

            var payload = new
            {
                message  = req.Message,
                history  = req.History,
                products = productList
            };

            var res = await _http.PostAsJsonAsync("http://localhost:8001/chat", payload);

            if (!res.IsSuccessStatusCode)
                return StatusCode(500, "AI service unavailable");

            var data = await res.Content.ReadFromJsonAsync<ChatResponse>();
            return Ok(data);
        }

        private async Task<List<object>> GetProductListAsync()
        {
            var cached = await _cache.GetStringAsync(CacheKey);
            if (cached != null)
                return JsonSerializer.Deserialize<List<object>>(cached)!;

            var modelsResult = await _modelService.GetModelds(null, null, null, [], [], 1, 100);
            var productList = modelsResult.Items.Select(m => (object)new
            {
                m.Id, m.Name, m.Color, m.Description, m.BasePrice, m.IsActive, m.Image
            }).ToList();

            await _cache.SetStringAsync(CacheKey, JsonSerializer.Serialize(productList),
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1)
                });

            return productList;
        }
    }
}
