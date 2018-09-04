using System.Linq;
using System.Xml.Linq;
using JetBrains.Annotations;

namespace FutoshikiDotOrgScraper
{
    internal sealed class ResponseParser
    {
        [NotNull]
        private static readonly char[] PuzzleCharsAllowed = "._1234567890^v()".ToCharArray();

        [CanBeNull]
        public string PuzzleText { get; }

        public bool IsValid { get; }

        public ResponseParser([NotNull] string sourceText, int puzzleSize)
        {
            Guard.NotNull(sourceText, nameof(sourceText));

            XDocument document = XDocument.Parse(sourceText);
            PuzzleText = document.Root?.Value;
            IsValid = IsPuzzleValid(PuzzleText, puzzleSize);
        }

        private static bool IsPuzzleValid([CanBeNull] string puzzleText, int puzzleSize)
        {
            return puzzleText != null && IsPuzzleLengthValid(puzzleText, puzzleSize) && IsPuzzleTextValid(puzzleText);
        }

        private static bool IsPuzzleLengthValid([NotNull] string puzzleText, int puzzleSize)
        {
            int lengthExpected = GetPuzzleTextLengthFor(puzzleSize);
            return puzzleText.Length == lengthExpected;
        }

        private static int GetPuzzleTextLengthFor(int puzzleSize)
        {
            int lineLength = puzzleSize * 2 - 1;
            int lineCount = 2 * lineLength;
            return lineCount * lineLength;
        }

        private static bool IsPuzzleTextValid([NotNull] string puzzleText)
        {
            foreach (char ch in puzzleText)
            {
                if (!PuzzleCharsAllowed.Contains(ch))
                {
                    return false;
                }
            }

            return true;
        }
    }
}
