using System;
using JetBrains.Annotations;

namespace FutoshikiDotOrgScraper
{
    /// <summary>
    /// Provides assertions for preconditions.
    /// </summary>
    internal static class Guard
    {
        [AssertionMethod]
        [ContractAnnotation("value: null => halt")]
        public static void NotNull<T>([CanBeNull] [NoEnumeration] T value, [NotNull] [InvokerParameterName] string name)
            where T : class
        {
            if (ReferenceEquals(value, null))
            {
                throw new ArgumentNullException(name);
            }
        }
    }
}
