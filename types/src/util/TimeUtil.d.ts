declare namespace _default {
    function getTimeInHighestRelevantUnit(val: any, unit: "milliseconds" | "seconds" | "minutes" | "hours" | "days" | "MILLISECOND" | "SECOND" | "MINUTE" | "HOUR" | "DAY"): {
        /**
         * the consolidated time
         */
        time: number;
        /**
         * the unit of the time
         */
        unit: "MILLISECOND" | "SECOND" | "MINUTE" | "HOUR" | "DAY";
    };
}
export default _default;
//# sourceMappingURL=TimeUtil.d.ts.map