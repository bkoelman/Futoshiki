using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using JetBrains.Annotations;

namespace FutoshikiDotOrgScraper
{
    internal sealed class SiteCrawler
    {
        private const string UrlTemplate = "https://www.futoshiki.org/get.cgi?size={0}&difficulty={1}&id={2}";
        private const string BaseFolder = @"..\..\..\..\..\puzzles";

        public void Crawl(CancellationToken cancellationToken)
        {
            string absoluteFolder = Path.Combine(Directory.GetCurrentDirectory(), BaseFolder);
            Directory.CreateDirectory(absoluteFolder);

            var tasks = new List<Task>();
            foreach (PuzzleDifficulty difficulty in Enum.GetValues(typeof(PuzzleDifficulty)))
            {
                foreach (int size in Enumerable.Range(4, 6))
                {
                    // This executes 4 x 6 (difficulties x sizes) = 24 concurrent HTTP requests, which gives better throughput
                    // than flooding the thread pool with pending requests by queueing each individual task using 'await'.
                    tasks.Add(Task.Run(
                        () => ProcessPuzzleSet(size, difficulty, absoluteFolder, cancellationToken).Wait(cancellationToken),
                        cancellationToken));
                }
            }

            Task.WaitAll(tasks.ToArray());
        }

        private static async Task ProcessPuzzleSet(int size, PuzzleDifficulty difficulty, [NotNull] string outputFolder,
            CancellationToken cancellationToken)
        {
            Console.WriteLine($"Scheduling download task for {difficulty.ToString().ToLowerInvariant()} {size}x{size} puzzles");
            foreach (int number in Enumerable.Range(1, 9999))
            {
                cancellationToken.ThrowIfCancellationRequested();

                await ProcessPuzzle(size, difficulty, number, outputFolder);
            }
        }

        private static async Task ProcessPuzzle(int size, PuzzleDifficulty difficulty, int number, [NotNull] string outputFolder)
        {
            string url = string.Format(UrlTemplate, size, (int)difficulty, number);
            string puzzlePath = outputFolder + string.Format(@"\{0}\{1:00}x{1:00}\Puzzle{2:0000}.txt", difficulty, size, number);

            if (!File.Exists(puzzlePath))
            {
                string html = await ExecuteRequestAsync(url);

                var parser = new ResponseParser(html, size);
                if (!parser.IsValid)
                {
                    throw new Exception($"Failed to parse puzzle from {url}: '{parser.PuzzleText}'");
                }

                string puzzleName = puzzlePath.Substring(outputFolder.Length);
                Console.WriteLine("Writing " + puzzleName);

                Directory.CreateDirectory(Path.GetDirectoryName(puzzlePath));

                var writer = new TextPuzzleWriter();
                writer.Save(puzzlePath, parser.PuzzleText);
            }
        }

        [NotNull]
        [ItemNotNull]
        private static async Task<string> ExecuteRequestAsync([NotNull] string url)
        {
            WebRequest webRequest = WebRequest.Create(url);
            using (WebResponse response = await webRequest.GetResponseAsync())
            {
                using (Stream stream = response.GetResponseStream())
                {
                    using (var reader = new StreamReader(stream))
                    {
                        return await reader.ReadToEndAsync();
                    }
                }
            }
        }
    }
}
