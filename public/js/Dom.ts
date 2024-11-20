// public/js/Dom.ts

class Dom {
    static container: HTMLElement | null;

    static init(): void {
        Dom.container = Dom.getById('container');
    }

    static loadCss(filename: string): void {
        const base = './css/';
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = base + filename;
        document.head.appendChild(link);
    }

    static removeCSS(filename: string): void {
        const links = document.getElementsByTagName('link');
        let found = false;
        for (let i = links.length - 1; i >= 0; i--) {
            if (links[i].href.includes(filename)) {
                document.head.removeChild(links[i]);
                found = true;
            }
        }
        if (!found) {
            console.log('CSS file not found');
        }
    }

    static getById(id: string): HTMLElement | null {
        return document.getElementById(id);
    }

    static addTdDiv(tr: HTMLElement, className?: string, id?: string, innerHTML?: string){
        const td = Dom.addElmt(tr, 'td', className, id) as HTMLTableCellElement
        const div = Dom.addElmt(td, 'div', undefined, undefined, innerHTML) as HTMLDivElement
        return {td, div}
    }

    static addElmt(
        parent: HTMLElement,
        type: string,
        className?: string,
        id?: string,
        innerHTML?: string
    ): HTMLElement {
        const element = document.createElement(type);
        if (id) element.id = id;
        if (innerHTML) element.innerHTML = innerHTML;
        if (className) element.classList.add(className);
        parent.appendChild(element);
        return element;
    }

    static getCurrentTimeFormatted(): string {
        const now = new Date();
        const year = String(now.getFullYear()).slice(2);
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${year}${month}${day}-${hours}${minutes}${seconds}`;
    }

    static eventStop(e:Event){
        e.preventDefault()
        e.stopPropagation()
    }
}

export {
    Dom
};
