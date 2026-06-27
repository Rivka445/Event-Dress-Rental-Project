using Confluent.Kafka;
using Microsoft.Extensions.Configuration;
using System.Text.Json;

public class KafkaProducerService : IKafkaProducerService
{
    private readonly IProducer<string, string> _producer;
    private readonly string _topic;

    public KafkaProducerService(IConfiguration configuration)
    {
        var config = new ProducerConfig
        {
            BootstrapServers = configuration["KafkaSettings:BootstrapServers"]
        };
        _topic = configuration["KafkaSettings:TopicName"];

        _producer = new ProducerBuilder<string, string>(config).Build();
    }

    public async Task SendMessageAsync(string key, object value)
    {
        var message = new Message<string, string>
        {
            Key = key,
            Value = JsonSerializer.Serialize(value)
        };
        await _producer.ProduceAsync(_topic, message);
    }
}