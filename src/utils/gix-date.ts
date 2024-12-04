class GixDate extends Date {
    constructor(date: Date) {
        super(date.getTime());
    }

    public toGixString() {
        const YYYY = this.getFullYear();
        const MM = String(this.getMonth() + 1).padStart(2, '0');
        const DD = String(this.getDate()).padStart(2, '0');

        return `${YYYY}${MM}${DD}`;
    }

    public static fromString(date: string) {
        const YYYY = Number(date.slice(0, 4));
        const MM = Number(date.slice(4, 6)) - 1;
        const DD = Number(date.slice(6, 8));

        return new GixDate(new Date(YYYY, MM, DD));
    }
}

export default GixDate;