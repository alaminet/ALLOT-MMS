import { useCallback } from "react";

function usePhoneNormalize(defaultCountryCode = "880") {
  const toE164 = useCallback(
    (number) => {
      if (!number) return "";

      // Remove all non-digit characters
      let digits = number.replace(/\D/g, "");

      // If already starts with country code
      if (digits.startsWith(defaultCountryCode)) {
        return `+${digits}`;
      }

      // If starts with 0, strip it
      if (digits.startsWith("0")) {
        digits = digits.substring(1);
      }

      return `+${defaultCountryCode}${digits}`;
    },
    [defaultCountryCode],
  );

  return { toE164 };
}

export default usePhoneNormalize;
