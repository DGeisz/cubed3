export function numberWithCommas(x: number): string {
    // return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parseFloat(x.toFixed(4)).toLocaleString("en-IN", {
        useGrouping: true,
    });
}
