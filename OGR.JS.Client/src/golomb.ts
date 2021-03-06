export class Golomb {


}

export class GolombRuler {
    markers: number[] = [];
    distances: number[] = [];

    constructor(public order: number, private maxSearchLength?: number) {

    }

    public firstStub(length: number): number[] {
        this.markers = [0];
        this.distances = [];

        while (this.markers.length < length)
            this.addMarker();

        return this.markers.map(x => x);
    }

    public nextStub(length: number, prevStub: number[] = [0]): number[] {
        this.markers = [];
        this.distances = [];

        prevStub.forEach(x => this.markers.push(x), this);

        this.calculateDistances();

        let adjustPositionCur = prevStub.length - 1;
        let adjustPositionMin = length - 1;

        let halfOrder = Math.ceil(this.order / 2) - 1;
        let halfMax = Math.ceil(this.maxSearchLength / 2);

        let results: number[] = [];
        let cycles = 0;

        do {
            let prevDist = this.clearMarkers(adjustPositionCur);
            this.addMarker(prevDist + 1);

            if (adjustPositionCur <= halfOrder && this.length() >= halfMax)
                adjustPositionCur--;

            while (this.markers.length < length) {
                this.addMarker();
                adjustPositionCur++;

                if (adjustPositionCur <= halfOrder && this.length() >= halfMax) {
                    adjustPositionCur--;
                    break;
                }
            }

        }
        while (adjustPositionCur != adjustPositionMin && adjustPositionCur > 0);

        if (adjustPositionCur == 0)
            return null;

        return this.markers.map(x => x);
    }

    public exhaust(stub: number[] = [0]): number[][] {
        this.markers = [];
        this.distances = [];

        stub.forEach(x => this.markers.push(x), this);

        this.calculateDistances();

        for (let i = this.markers.length - 1; i < this.order - 1; i++)
            this.addMarker();

        let shortestLength = this.length();

        if (!this.maxSearchLength || this.maxSearchLength > shortestLength)
            this.maxSearchLength = shortestLength;

        let adjustPositionCur = this.order - 2;
        let adjustPositionMin = stub.length - 1;

        let halfOrder = Math.ceil(this.order / 2) - 1;
        let halfMax = Math.ceil(this.maxSearchLength / 2);

        let results: number[][] = [];
        results.push(this.markers.map(x => x));

        let cycles = 0;

        do {
            let prevDist = this.clearMarkers(adjustPositionCur);
            this.addMarker(prevDist + 1);

            while (this.length() < this.maxSearchLength && this.markers.length < this.order) {
                if (adjustPositionCur <= halfOrder && this.length() >= halfMax) {
                    adjustPositionCur--;
                    break;
                }

                this.addMarker();
                adjustPositionCur++;
            }

            if (this.markers.length == this.order && this.length() <= shortestLength) {

                if (this.length() < shortestLength)
                    results = [];

                results.push(this.markers.map(x => x));

                shortestLength = this.length();

                if (this.maxSearchLength > shortestLength) {
                    this.maxSearchLength = shortestLength;
                    halfMax = Math.ceil(this.maxSearchLength / 2);
                }
            }

            if (this.markers.length == adjustPositionCur + 1)
                adjustPositionCur--;

            // console.log(this.print(this.markers));

            cycles++;
        }
        while (adjustPositionCur > adjustPositionMin);

        results.push([cycles]);

        return results;
    }

    public find(stopAtOrder?: number): number[][] {
        let shortestLength = this.length();
        // console.log(this.print(this.markers));

        if (!this.maxSearchLength || this.maxSearchLength > shortestLength)
            this.maxSearchLength = shortestLength;

        if (!stopAtOrder)
            stopAtOrder = this.order;

        let adjustPositionCur = this.order - 2;
        let adjustPositionMin = 0; // this.stub.length - 1;

        let halfOrder = Math.ceil(this.order / 2) - 1;
        let halfMax = Math.ceil(this.maxSearchLength / 2);

        let results: number[][] = [];
        results.push(this.markers.map(x => x));

        let cycles = 0;

        do {
            let prevDist = this.clearMarkers(adjustPositionCur);
            this.addMarker(prevDist + 1);

            while (this.markers.length < stopAtOrder && this.length() < this.maxSearchLength) {
                if (adjustPositionCur <= halfOrder && this.length() >= halfMax) {
                    adjustPositionCur--;
                    break;
                }

                this.addMarker();
                adjustPositionCur++;
            }

            if (stopAtOrder != this.order && cycles == 3) {
                if (this.markers.length == stopAtOrder) {
                    results = [];
                    results.push(this.markers.map(x => x));
                    break;
                }

            }
            else {
                // console.log(this.print(this.markers));

                if (this.markers.length == this.order && this.length() <= shortestLength) {
                    // console.log(this.print(this.markers));

                    if (this.length() < shortestLength)
                        results = [];

                    results.push(this.markers.map(x => x));

                    shortestLength = this.length();

                    if (this.maxSearchLength > shortestLength) {
                        this.maxSearchLength = shortestLength;
                        halfMax = Math.ceil(this.maxSearchLength / 2);
                    }
                }
            }

            // if (ruler.markers.length > 5 && 
            //     ruler.markers[1] == 1 && 
            //     ruler.markers[2] == 5 && 
            //     ruler.markers[3] == 12 && 
            //     ruler.markers[4] == 22
            //     && ruler.markers[5] > 44) 
            //      {
            //     let xc = "sdf";
            // }

            if (this.markers.length == adjustPositionCur + 1)
                adjustPositionCur--;

            cycles++;
        }
        while (adjustPositionCur > adjustPositionMin);
        // while (this.count < 90000000 && adjustPosition > 0);

        results.push([cycles]);

        return results;
    }

    public print(markers: number[]): string {
        return `markers: ${markers.map(x => x + "")}`; // distances: ${this.distances.map(x => x + " ")}`;
    }

    private length(): number {
        return this.markers[this.markers.length - 1];
    }

    private addMarker(minDistance: number = 1): void {
        let newDistance = this.smallestValidDistance(minDistance);
        this.markers.push(this.markers[this.markers.length - 1] + newDistance);
        this.calculateDistances();
    }

    private removeMarkers(): void {
        this.clearMarkers(this.markers.length - 2);
    }

    private clearMarkers(after: number = 0): number {
        this.markers.splice(after + 1);
        let curDistance = this.markers[this.markers.length - 1] - this.markers[this.markers.length - 2];
        this.markers.splice(after);
        this.calculateDistances();
        return curDistance;
    }

    private progressMarker(curDistance: number): void {
        // let curDistance = this.markers[this.markers.length - 1] - this.markers[this.markers.length - 2];

        // this.removeMarker();

        let newDistance = this.smallestValidDistance(curDistance + 1);
        this.markers[this.markers.length - 1] = this.markers[this.markers.length - 2] + newDistance;
        this.calculateDistances();
    }

    private smallestValidDistance(minDistance: number = 1): number {
        let i = minDistance;

        let marker = this.markers[this.markers.length - 1] + minDistance;

        do {
            let newDists = this.newDistancesByMarker(marker);

            if (!newDists.some(x => this.distances.find(y => y === x) != null))
                return i++;

            i++;
            marker++;
        }
        while (true);
    }

    private newDistancesByMarker(marker: number): number[] {
        return this.markers.map(x => marker - x);
    }

    private calculateDistances(): void {
        this.distances = [];

        for (var i = 0; i < this.markers.length - 1; i++)
            for (var j = i + 1; j < this.markers.length; j++)
                this.distances.push(this.markers[j] - this.markers[i]);

        // console.log(print());
    }


}