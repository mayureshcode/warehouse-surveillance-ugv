/* Warehouse rover mesh overlay: isolated from SLAM and navigation. */
(function () {
    'use strict';
    if (typeof THREE === 'undefined' || typeof Viewer3D !== 'function') {
        console.error('[WAREHOUSE GLB] Three.js or Viewer3D is unavailable');
        return;
    }
    const CONFIG = {
        url: '/assets/WAREhouse_rover.glb',
        visualZOffset:0.65,  // meters: 3D dashboard ONLY
        // Original rover GLB was exported Y-up; Gazebo/ROS use Z-up.
        modelToRosXRotation: Math.PI / 2,
        // Display size guard for unusually scaled exported GLBs.
        largestDimensionMeters: 1.2
    };
    const originalCreate = Viewer3D.prototype.createRobotMarker;
    const originalPose = Viewer3D.prototype.updateRobotPose;
    const originalModel = Viewer3D.prototype.updateRobotModel;

    Viewer3D.prototype.createRobotMarker = function () {
        originalCreate.call(this);
        const viewer = this;
        const roverRoot = new THREE.Group();
        roverRoot.name = 'warehouse_rover_visual_only';
        viewer.scene.add(roverRoot);
        viewer.warehouseRoverGLB = roverRoot;
        viewer.warehouseRoverLoaded = false;
        if (typeof THREE.GLTFLoader !== 'function') {
            console.error('[WAREHOUSE GLB] GLTFLoader missing, keeping original marker');
            return;
        }
        const loader = new THREE.GLTFLoader();
        loader.load(CONFIG.url, function (gltf) {
            try {
                const model = gltf.scene;
                model.rotation.x = CONFIG.modelToRosXRotation;
                model.updateMatrixWorld(true);
                let box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3());
                const maxDimension = Math.max(size.x, size.y, size.z);
                if (!Number.isFinite(maxDimension) || maxDimension <= 0) {
                    throw new Error('Invalid GLB bounds: ' + maxDimension);
                }
                // Normalize exported mesh so it cannot disappear due to oversized
                // Blender coordinates; dashboard-only and not a physical scale change.
                const displayScale = CONFIG.largestDimensionMeters / maxDimension;
                model.scale.multiplyScalar(displayScale);
                model.updateMatrixWorld(true);
                box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                model.position.x -= center.x;
                model.position.y -= center.y;
                model.position.z -= box.min.z;
                roverRoot.add(model);
                viewer.warehouseRoverLoaded = true;
                viewer.robotMarker.visible = false;
                roverRoot.position.copy(viewer.robotMarker.position);
                roverRoot.position.z += CONFIG.visualZOffset;
                roverRoot.rotation.copy(viewer.robotMarker.rotation);
                console.info('[WAREHOUSE GLB] Rover loaded:', CONFIG.url,
                             'scale:', displayScale,
                             'visual Z offset:', CONFIG.visualZOffset);
            } catch (error) {
                viewer.robotMarker.visible = true;
                console.error('[WAREHOUSE GLB] Model setup failed:', error);
            }
        }, undefined, function (error) {
            viewer.robotMarker.visible = true;
            console.error('[WAREHOUSE GLB] GLB download/decode failed:', error);
        });
    };

    Viewer3D.prototype.updateRobotPose = function (...args) {
        originalPose.apply(this, args);
        if (this.warehouseRoverGLB && this.warehouseRoverLoaded) {
            this.warehouseRoverGLB.position.copy(this.robotMarker.position);
            this.warehouseRoverGLB.position.z += CONFIG.visualZOffset;
            this.warehouseRoverGLB.rotation.copy(this.robotMarker.rotation);
        }
    };

    Viewer3D.prototype.updateRobotModel = function (...args) {
        originalModel.apply(this, args);
        if (this.warehouseRoverLoaded) this.robotMarker.visible = false;
    };
})();
