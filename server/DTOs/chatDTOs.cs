using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public record ChatRequest(
        string Message,
        List<HistoryItem> History,
        List<object> Products);   

    public record HistoryItem(string Role, string Content);
    public record ChatResponse(string Reply);
}
