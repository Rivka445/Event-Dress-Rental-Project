using Entities;
using DTOs;
using Microsoft.AspNetCore.Mvc;
using Repositories;
using Services;
using System.Collections.Generic;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization; 

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace EventDressRental.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly HttpClient _http;
        public ChatController(IHttpClientFactory factory)
            => _http = factory.CreateClient();

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ChatRequest req)
        {
            var res = await _http.PostAsJsonAsync(
                "http://localhost:8001/chat", req);

            if (!res.IsSuccessStatusCode)
                return StatusCode(500, "AI service unavailable");

            var data = await res.Content
                .ReadFromJsonAsync<ChatResponse>();
            return Ok(data);
        }
    }
}

