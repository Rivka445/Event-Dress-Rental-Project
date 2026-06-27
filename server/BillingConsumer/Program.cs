using System;
using System.Threading;
using Confluent.Kafka;

class Program
{
    static void Main(string[] args)
    {
        var config = new ConsumerConfig
        {
            BootstrapServers = "localhost:9092", 
            GroupId = "billing-service-group",   
            AutoOffsetReset = AutoOffsetReset.Earliest,
            EnableAutoCommit = false 
        };

        var topic = "OrderNotifications"; 

        using var consumer = new ConsumerBuilder<string, string>(config).Build();
        consumer.Subscribe(topic);

        Console.WriteLine($"[-] Listening for messages on topic: {topic}...");

        CancellationTokenSource cts = new CancellationTokenSource();
        Console.CancelKeyPress += (_, e) => {
            e.Cancel = true;
            cts.Cancel();
        };

        try
        {
            while (true)
            {
                try
                {
                    var consumeResult = consumer.Consume(cts.Token);

                    Console.WriteLine($"\n[NEW ORDER DETECTED AT {DateTime.Now}]");
                    Console.WriteLine($"Partition: {consumeResult.Partition} | Offset: {consumeResult.Offset}");
                    Console.WriteLine($"Key (Order ID): {consumeResult.Message.Key}");
                    Console.WriteLine($"Value (Details JSON): {consumeResult.Message.Value}");

                    consumer.Commit(consumeResult);
                }
                catch (ConsumeException e)
                {
                    Console.WriteLine($"Error occurred: {e.Error.Reason}");
                }
            }
        }
        catch (OperationCanceledException)
        {
            consumer.Close();
            Console.WriteLine("\n[-] Consumer stopped gracefully.");
        }
    }
}