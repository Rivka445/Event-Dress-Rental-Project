using AutoMapper;
using Entities;
using DTOs;
using Repositories;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using StackExchange.Redis;

namespace Services
{
    public class ModelService : IModelService
    {
    private readonly IModelRepository _modelRepository;
    private readonly IDressService _dressService;
    private readonly ICategoryService _categoryService;
        private readonly IMapper _mapper;
        private readonly IDistributedCache _cache;
        private readonly IConfiguration _configuration;

        public ModelService(IModelRepository modelRepository, IMapper mapper, IDressService dressService, ICategoryService categoryService, IDistributedCache cache, IConfiguration configuration)
        {
            _mapper = mapper;
            _dressService = dressService;
            _modelRepository = modelRepository;
            _categoryService = categoryService;
            _cache = cache;
            _configuration = configuration;
        }
        public async Task<bool> IsExistsModelById(int id)
        {
            return await _modelRepository.IsExistsModelById(id);
        }
        public async Task<bool> checkCategories(List<int> categories)
        {
            for (int i = 0; i < categories.Count(); i++) {
                if (!await _categoryService.IsExistsCategoryById(categories[i]))
                    return false;
            }
            return true;
        }
        public bool checkPrice(int price)
        {
            return price > 0;
        }
        public bool ValidateQueryParameters(int position, int skip, int? minPrice, int? maxPrice)
        {
            if(minPrice.HasValue && maxPrice.HasValue)
                return position >= 0 && skip >= 0 && minPrice < maxPrice;
            return position >= 0 && skip >= 0;
        }
        public async Task<ModelDTO> GetModelById(int id)
        {
            Model? model = await _modelRepository.GetModelById(id);
            if (model == null)
                return null;
            ModelDTO modelDTO = _mapper.Map<Model, ModelDTO>(model);
            return modelDTO;
        }
        public async Task<FinalModels> GetModelds(string? description, int? minPrice, int? maxPrice,
            int[] categoriesId, string[] colors, int position = 1, int skip = 8)
        {
            string categoriesString = categoriesId != null ? string.Join("-", categoriesId) : "";
            string cacheKey = $"Models_pos{position}_skip{skip}_min{minPrice}_max{maxPrice}_cat{categoriesString}_desc{description}";
            string? cachedJson = await _cache.GetStringAsync(cacheKey);
            if (!string.IsNullOrEmpty(cachedJson))
            {
                var cachedResult = JsonSerializer.Deserialize<FinalModels>(cachedJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (cachedResult != null && cachedResult.Items != null && cachedResult.Items.Any())
                    return cachedResult;
            }

            (List<Model> Items, int TotalCount) products = await _modelRepository
                        .GetModels(description, minPrice, maxPrice, categoriesId, colors, position, skip);
            List<ModelDTO> productsDTO = _mapper.Map<List<Model>, List<ModelDTO>>(products.Items);
            bool hasNext = (products.TotalCount - (position * skip)) > 0;
            bool hasPrev = position > 1;
            FinalModels finalProducts = new()
            {
                Items = productsDTO,
                TotalCount = products.TotalCount,
                HasNext = hasNext,
                HasPrev = hasPrev
            };

            var ttlFromConfig = 3600;
            var ttlString = _configuration["RedisCacheOptions:TTL_In_Seconds"];
            if (!string.IsNullOrEmpty(ttlString) && int.TryParse(ttlString, out var parsedTtl))
            {
                ttlFromConfig = parsedTtl;
            }
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(ttlFromConfig)
            };
            var json = JsonSerializer.Serialize(finalProducts, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

            await _cache.SetStringAsync(cacheKey, json, options);

            return finalProducts;
        }
        public async Task<ModelDTO> AddModel(NewModelDTO newModel)
        {
            Model addedModel = _mapper.Map<NewModelDTO, Model>(newModel);
            addedModel.IsActive = true;
            Model model = await _modelRepository.AddModel(addedModel);
            ModelDTO modelDTO = _mapper.Map<Model, ModelDTO>(model);
            // invalidate caches matching pattern
            var redisConn = _configuration["ConnectionStrings:Redis"] ?? _configuration["Redis:Configuration"];
            var connection = await ConnectionMultiplexer.ConnectAsync(redisConn ?? "localhost:6379");
            var server = connection.GetServer(connection.GetEndPoints().First());
            var database = connection.GetDatabase();
            var keys = server.Keys(pattern: "*Models_*").ToArray();
            foreach (var key in keys)
            {
                await database.KeyDeleteAsync(key);
            }
            return modelDTO;
        }
        public async Task UpdateModel(int id, NewModelDTO updateModel)
        {
            Model update = _mapper.Map<NewModelDTO, Model>(updateModel);
            update.Id = id;
            update.IsActive = true;
            await _modelRepository.UpdateModel(update);
            var redisConn = _configuration["ConnectionStrings:Redis"] ?? _configuration["Redis:Configuration"];
            var connection = await ConnectionMultiplexer.ConnectAsync(redisConn ?? "localhost:6379");
            var server = connection.GetServer(connection.GetEndPoints().First());
            var database = connection.GetDatabase();
            var keys = server.Keys(pattern: "*Models_*").ToArray();
            foreach (var key in keys)
            {
                await database.KeyDeleteAsync(key);
            }
        }
        public async Task DeleteModel(int id)
        {
            Model? model = await _modelRepository.GetModelById(id);
            foreach (var dress in model.Dresses)
            {
                DressDTO dressDTO = _mapper.Map<Dress, DressDTO>(dress);
                await _dressService.DeleteDress(dress.Id);
            }
            await _modelRepository.DeleteModel(id);
            var redisConn = _configuration["ConnectionStrings:Redis"] ?? _configuration["Redis:Configuration"];
            var connection = await ConnectionMultiplexer.ConnectAsync(redisConn ?? "localhost:6379");
            var server = connection.GetServer(connection.GetEndPoints().First());
            var database = connection.GetDatabase();
            var keys = server.Keys(pattern: "*Models_*").ToArray();
            foreach (var key in keys)
            {
                await database.KeyDeleteAsync(key);
            }
        }
    }
}
