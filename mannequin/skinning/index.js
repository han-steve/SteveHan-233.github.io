import { initializeCanvas } from "./App.js";
import Vue from "../lib/vue/vue.js";
const animation = initializeCanvas();
const PX_PER_SECOND = 68;
let app = new Vue({
    el: "#timeline",
    data: {
        seconds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        dragging: {
            prevX: undefined,
            element: -2, // -1 is playhead, 0 - n is keyframe 0 - n
        },
        playheadTime: 0,
        keyframes: [],
        showSkeleton: true,
    },
    methods: {
        dragMouseDown: function (e, element) {
            e.preventDefault();
            this.dragging.prevX = e.clientX;
            this.dragging.element = element;
            document.onmousemove = this.drag;
            document.onmouseup = this.dragMouseUp;
        },
        drag: function (e) {
            e.preventDefault();
            let deltaX = e.clientX - this.dragging.prevX;
            this.dragging.prevX = e.clientX;
            if (this.dragging.element == -1) {
                let newTime = this.playheadTime + deltaX / PX_PER_SECOND;
                if (newTime >= 0 && newTime < 10) {
                    this.playheadTime = newTime;
                }
                else {
                    this.dragMouseUp();
                }
            }
            else if (this.dragging.element > 0) {
                let newTime = this.keyframes[this.dragging.element].time + deltaX / PX_PER_SECOND;
                if (newTime >= 0 && newTime < 10) {
                    this.keyframes[this.dragging.element].time = newTime;
                    animation.getScene().meshes[0].keyFrames[this.dragging.element].time = newTime;
                }
                else {
                    this.dragMouseUp();
                }
            }
        },
        dragMouseUp: function () {
            document.onmouseup = null;
            document.onmousemove = null;
        },
        setKeyframe: function () {
            animation.getGUI().addKeyFrame();
        },
        startPlayBack: function () {
            animation.getGUI().startPlayBack();
        },
    },
    computed: {
        playheadLeft: function () {
            return this.playheadTime * PX_PER_SECOND;
        },
    },
});
export default app;
//# sourceMappingURL=index.js.map