
public interface IKafkaProducerService
{
    Task SendMessageAsync(string key, object value);
}