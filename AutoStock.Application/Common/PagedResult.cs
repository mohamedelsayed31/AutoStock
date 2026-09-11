using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoStock.Application.Common
{
    public class PagedResult<T>
    {
        public IEnumerable<T> Items { get; set; }
            = new List<T>();

        public int Page { get; set; }

        public int PageSize { get; set; }

        public int TotalCount { get; set; }

        public int TotalPages { get; set; }

        public bool HasPreviousPage =>
            Page > 1;

        public bool HasNextPage =>
            Page < TotalPages;
    }
}
