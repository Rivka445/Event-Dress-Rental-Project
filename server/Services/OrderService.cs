using AutoMapper;
using DTOs;
using Entities;
using Microsoft.Extensions.Logging;
using Repositories;

namespace Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IUserService _userService;
        private readonly IDressService _dressService;
        private readonly IMapper _mapper;
        private readonly ILogger<OrderService> _logger;
        private readonly IKafkaProducerService _kafkaProducerService;

        public OrderService(IOrderRepository orderRepository, IMapper mapper, IUserService userService,
            IDressService dressService, ILogger<OrderService> logger, IKafkaProducerService kafkaProducer)
        {
            _userService = userService;
            _mapper = mapper;
            _orderRepository = orderRepository;
            _dressService = dressService;
            _logger = logger;
            _kafkaProducerService = kafkaProducer;
        }

        public async Task<bool> IsExistsOrderById(int id)
        {
            return await _orderRepository.IsExistsOrderById(id);
        }

        public async Task<bool> checkOrderItems(NewOrderDTO newOrder)
        {
            Order postOrder = _mapper.Map<NewOrderDTO, Order>(newOrder);
            foreach (var item in postOrder.OrderItems)
            {
                if (await _dressService.GetDressById(item.DressId) == null)
                {
                    _logger.LogWarning("checkOrderItems failed: dress {DressId} not found for user {UserId}", item.DressId, postOrder.UserId);
                    return false;
                }
                bool isValid = await _dressService.IsDressAvailable(item.DressId, postOrder.EventDate);
                if (!isValid)
                {
                    _logger.LogWarning("checkOrderItems failed: dress {DressId} unavailable for date {EventDate}", item.DressId, postOrder.EventDate);
                    return false;
                }
            }
            _logger.LogInformation("checkOrderItems passed for user {UserId} with {ItemCount} items", postOrder.UserId, postOrder.OrderItems.Count);
            return true;
        }

        public async Task<bool> checkOrderItems(OrderDTO newOrder)
        {
            Order postOrder = _mapper.Map<OrderDTO, Order>(newOrder);
            foreach (var item in postOrder.OrderItems)
            {
                if (await _dressService.GetDressById(item.DressId) == null)
                {
                    _logger.LogWarning("checkOrderItems(OrderDTO) failed: dress {DressId} not found", item.DressId);
                    return false;
                }
            }
            return true;
        }

        public bool checkStatus(int status)
        {
            var isValid = status >= 1 && status <= 4;
            if (!isValid)
                _logger.LogWarning("checkStatus failed: status {Status} is out of range", status);
            return isValid;
        }

        public bool checkDate(DateOnly date)
        {
            return date > DateOnly.FromDateTime(DateTime.Now);
        }

        public bool checkDate(DateOnly orderDate, DateOnly eventDate)
        {
            return orderDate >= DateOnly.FromDateTime(DateTime.Now) && eventDate >= DateOnly.FromDateTime(DateTime.Now);
        }

        public async Task<bool> checkPrice(NewOrderDTO order)
        {
            Order postOrder = _mapper.Map<NewOrderDTO, Order>(order);
            int sum = 0;
            foreach (var item in postOrder.OrderItems)
                sum += await _dressService.GetPriceById(item.DressId);

            if (sum != postOrder.FinalPrice)
            {
                _logger.LogWarning("checkPrice failed: expected {Expected} calculated {Calculated} for user {UserId}", postOrder.FinalPrice, sum, postOrder.UserId);
                return false;
            }
            _logger.LogInformation("checkPrice passed: total {Total} for user {UserId}", sum, postOrder.UserId);
            return true;
        }

        public async Task<bool> checkPrice(OrderDTO order)
        {
            Order postOrder = _mapper.Map<OrderDTO, Order>(order);
            int sum = 0;
            foreach (var item in postOrder.OrderItems)
                sum += await _dressService.GetPriceById(item.DressId);
            return sum == postOrder.FinalPrice;
        }

        public async Task<OrderDTO> GetOrderById(int id)
        {
            Order? order = await _orderRepository.GetOrderById(id);
            if (order == null)
                return null;
            return _mapper.Map<Order, OrderDTO>(order);
        }

        public async Task<List<OrderDTO>> GetAllOrders()
        {
            List<Order> orders = await _orderRepository.GetAllOrders();
            return _mapper.Map<List<Order>, List<OrderDTO>>(orders);
        }

        public async Task<List<OrderDTO>> GetOrderByUserId(int userId)
        {
            var orders = await _orderRepository.GetOrderByUserId(userId);
            return _mapper.Map<List<Order>, List<OrderDTO>>(orders);
        }

        public async Task<List<OrderDTO>> GetOrdersByDate(DateOnly date)
        {
            List<Order> orders = await _orderRepository.GetOrdersByDate(date);
            return _mapper.Map<List<Order>, List<OrderDTO>>(orders);
        }

        public async Task<OrderDTO> AddOrder(NewOrderDTO newOrder)
        {
            Order postOrder = _mapper.Map<NewOrderDTO, Order>(newOrder);
            postOrder.StatusId = 1;
            Order order = await _orderRepository.AddOrder(postOrder);
            OrderDTO orderDTO = _mapper.Map<Order, OrderDTO>(order);

            try
            {
                await _kafkaProducerService.SendMessageAsync(order.Id.ToString(), orderDTO);
                _logger.LogInformation("Kafka: Message sent for Order {OrderId}", order.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kafka: Failed to send message for Order {OrderId}", order.Id);
            }

            return orderDTO;
        }

        public async Task UpdateStatusOrder(int orderId, int statusId)
        {
            await _orderRepository.UpdateStatusOrder(new Order { Id = orderId, StatusId = statusId });
        }
    }
}
