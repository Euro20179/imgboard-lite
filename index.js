"use strict";
const canvas = document.getElementById("canvas");
class Img {
    constructor(imgElement) {
        this.dragging = 0;
        this._resizing = 0;
        this.originalOffsetX = 0;
        this.originalOffsetY = 0;
        this.imgElement = imgElement;
        this.imgElement.addEventListener("dblclick", e => {
            e.preventDefault();
            this.resizing = 1;
        });
        this.imgElement.addEventListener("dragstart", e => {
            if (!this.resizing) {
                e.preventDefault();
                this.dragging = 1;
                this.originalOffsetX = e.offsetX;
                this.originalOffsetY = e.offsetY;
            }
        });
        this.imgElement.addEventListener("mouseup", e => {
            e.preventDefault();
            this.dragging = 0;
            if (e.button === 2) {
                this.resizing = 0;
            }
        });
        this.imgElement.addEventListener("mousedown", e => {
            console.log(e.button);
            for (let img of images) {
                img.unclick();
            }
            if (e.button === 0) {
                this.click();
                e.stopPropagation();
            }
            else if (e.button === 2) {
                this.resizing ^= 1;
                e.stopPropagation();
            }
        }, { capture: true });
        this.imgElement.addEventListener("contextmenu", e => {
            e.preventDefault();
            e.stopPropagation();
        });
    }
    get selected() {
        return this.imgElement.getAttribute("data-selected") === "true" ? true : false;
    }
    get resizing() {
        return this._resizing;
    }
    set resizing(value) {
        this._resizing = value;
        this.imgElement.setAttribute('data-resizing', this.resizing ? "true" : "false");
        this.aspectRatio = this.imgElement.width / this.imgElement.height;
    }
    unclick() {
        this.imgElement.setAttribute('data-selected', "false");
        this.resizing = 0;
        this.dragging = 0;
    }
    click() {
        this.imgElement.setAttribute('data-selected', "true");
        //if resizing click to stop, idk why but this feels intuitive
        if (this.resizing) {
            this.resizing = 0;
        }
    }
    move(newX, newY) {
        this.imgElement.style.left = `${newX - this.originalOffsetX}px`;
        this.imgElement.style.top = `${newY - this.originalOffsetY}px`;
    }
    resize(dX, dY, shifting) {
        this.imgElement.width += dX;
        if (!shifting) {
            this.imgElement.height = this.imgElement.width / (this.aspectRatio || 1);
        }
        else
            this.imgElement.height += dY;
    }
}
let images = [];
window.addEventListener("mousemove", e => {
    for (let image of images) {
        if (image.dragging) {
            image.move(e.pageX, e.pageY);
        }
        else if (image.resizing) {
            image.resize(e.movementX, e.movementY, e.ctrlKey);
        }
    }
});
window.addEventListener("keydown", e => {
    console.log(e.key);
    if (e.key === "Delete") {
        for (let img of images.slice(0)) {
            if (img.selected) {
                images = images.filter(v => v.imgElement !== img.imgElement);
                img.imgElement.remove();
            }
        }
    }
    else if (e.key === "y") {
        for (let img of images.slice(0)) {
            if (img.selected) {
                let elem = img.imgElement.cloneNode(true);
                let imgNew = new Img(elem);
                images.push(imgNew);
                canvas.append(elem);
            }
        }
    }
});
window.addEventListener("mousedown", e => {
    for (let img of images) {
        img.unclick();
    }
});
window.addEventListener("paste", e => {
    var _a;
    const items = ((_a = e.clipboardData) === null || _a === void 0 ? void 0 : _a.items) || [];
    for (let item of items) {
        if (item.kind === 'file') {
            let blob = item.getAsFile();
            let reader = new FileReader();
            reader.onload = function (e) {
                var _a;
                const img = new Image();
                const imgWrapper = new Img(img);
                images.push(imgWrapper);
                img.src = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
                imgWrapper.aspectRatio = img.width / img.height;
                img.classList.add("draggable");
                canvas.append(img);
            };
            reader.readAsDataURL(blob);
        }
    }
});
