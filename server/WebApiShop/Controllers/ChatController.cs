using DTOs;
using Microsoft.AspNetCore.Mvc;
using Services;

namespace EventDressRental.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly HttpClient _http;
        private readonly IModelService _modelService;

        public ChatController(IHttpClientFactory factory, IModelService modelService)
        {
            _http = factory.CreateClient();
            _modelService = modelService;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ChatRequest req)
        {
            var modelsResult = await _modelService.GetModelds(null, null, null, [], [], 1, 100);

            var productList = modelsResult.Items.Select(m => new
            {
                m.Name,
                m.Color,
                m.Description,
                m.BasePrice,
                m.IsActive
            });

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
    }
}

