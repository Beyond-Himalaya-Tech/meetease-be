    export const rules: Record<
      string,
      {
        min: number;
        max: number;
        startsWith?: RegExp;
        message?: string;
      }
    > = {
      "+977": {
        min: 10,
        max: 10,
        startsWith: /^(97|98)/,
        message: "Nepal numbers must start with 97 or 98",
      },
      "+91": {
        min: 10,
        max: 10,
        startsWith: /^[6-9]/,
        message: "India numbers must start with 6–9",
      },
      "+61": {
        min: 9,
        max: 9,
        startsWith: /^4/,
        message: "Australia numbers must start with 4",
      },
      "+44": {
        min: 10,
        max: 10,
        startsWith: /^7/,
        message: "UK mobile numbers must start with 7",
      },
      "+1": {
        min: 10,
        max: 10,
      },
    };