using System;
using System.Threading;

namespace FutoshikiDotOrgScraper
{
    internal static class Program
    {
        private static void Main()
        {
            CancellationToken cancellationToken = RegisterConsoleBreak();

            var crawler = new SiteCrawler();
            crawler.Crawl(cancellationToken);

            Console.WriteLine();
            Console.WriteLine("All puzzles downloaded. Press any key to close.");
            Console.ReadKey();
        }

        private static CancellationToken RegisterConsoleBreak()
        {
            var cancellationTokenSource = new CancellationTokenSource(60000);

            Console.CancelKeyPress += (sender, e) =>
            {
                e.Cancel = true;
                cancellationTokenSource.Cancel();
            };
            return cancellationTokenSource.Token;
        }
    }
}
