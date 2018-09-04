using System.IO;
using JetBrains.Annotations;

namespace FutoshikiDotOrgScraper
{
    internal sealed class TextPuzzleWriter
    {
        public void Save([NotNull] string path, [NotNull] string puzzleText)
        {
            using (FileStream fileStream = File.Create(path))
            {
                using (TextWriter textWriter = new StreamWriter(fileStream))
                {
                    textWriter.Write(puzzleText);
                }
            }
        }
    }
}
