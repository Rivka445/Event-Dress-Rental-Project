using DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Distributed;
using Services;
using System.Text.Json;

namespace EventDressRental.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly HttpClient _http;
        private readonly IModelService _products;
        private readonly IDistributedCache _cache;
        private const string CacheKey = "product_list";

        public SearchController(IHttpClientFactory f, IModelService products, IDistributedCache cache)
        { _http = f.CreateClient(); _products = products; _cache = cache; }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] SearchQuery req)
        {
            if (string.IsNullOrWhiteSpace(req.Query))
                return BadRequest("Query cannot be empty");
            if (req.Query.Length > 500)
                return BadRequest("Query too long");
            var productList = await GetProductListAsync();

            var res = await _http.PostAsJsonAsync(
                "http://localhost:8001/search",
                new { query = req.Query, products = productList, top_k = 5 });

            var data = await res.Content.ReadFromJsonAsync<SearchResponse>();
            return Ok(data);
        }

        private async Task<List<object>> GetProductListAsync()
        {
            var cached = await _cache.GetStringAsync(CacheKey);
            if (cached != null)
                return JsonSerializer.Deserialize<List<object>>(cached)!;

            var modelsResult = await _products.GetModelds(null, null, null, [], [], 1, 50);
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
