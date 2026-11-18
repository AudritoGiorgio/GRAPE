export const datasets = [
  {
    id: 'track', name: 'GRAPE-Track', doi: '10.5281/zenodo.22960111',
    role: 'Bounding boxes with a persistent ID per cluster, for detection, tracking and counting.',
    specs: [['Size', '2.43 GB'], ['Format', 'JPG + CVAT XML 1.1'], ['Tasks', 'Detection, multi-object tracking'], ['Licence', 'CC BY 4.0']],
    treeTitle: 'Folder structure',
    tree: `GRAPE-Track/
├── split01_1/
│   ├── 2025_06_27/
│   │   ├── images/  *.jpg
│   │   └── annotations.xml
│   ├── 2025_07_11/
│   └── … 6 sessions
├── split01_2/ … split02_x/
└── README.md`,
    notes: ['15,000 frames, about 200 tracked clusters', '5 fixed sections over 2 rows, the same in all 6 sessions', 'Splits 1–3 train · 4 validation · 5 test, physically separated', 'Two annotators; every frame checked by one reviewer'],
    code: `pip install zenodo_get
zenodo_get 10.5281/zenodo.22960111

# protocol: train 1–3 · val 4 · test 5`,
  },
  {
    id: 'bag', name: 'GRAPE-Bag', doi: '10.5281/zenodo.22957213',
    role: 'Raw ROS 2 recordings from the rover, for localisation, sensor fusion and mapping.',
    specs: [['Size', '49.1 GB'], ['Format', 'ROS 2 .mcap (zstd)'], ['Tasks', 'Mapping, fusion, RGB-D'], ['Licence', 'CC BY 4.0']],
    treeTitle: 'Key ROS topics',
    tree: `/husky/sensors/camera_0/…        D435   30 Hz
/husky/sensors/camera_1/…        D405   30 Hz
/husky/sensors/imu_0/imu/data          100 Hz
/husky/sensors/gps_0/navsatfix           5 Hz
/husky/platform/odom/filtered           50 Hz
/husky/tf   /husky/tf_static`,
    notes: ['Clearpath Husky A200, teleoperated along the row', 'RealSense D435 (0.8 m) and D405 (0.5 m), RGB + aligned depth', 'Duro dual-antenna RTK GNSS, MicroStrain 3DM-GX5 AHRS', 'Camera and platform .yaml configs and all extrinsics included'],
    code: `zenodo_get 10.5281/zenodo.22957213
unzstd session_2025_06_27.mcap.zst
ros2 bag play session_2025_06_27.mcap`,
  },
  {
    id: 'seg', name: 'GRAPE-Seg', doi: '10.5281/zenodo.22960131',
    role: 'Instance masks of grape clusters across all six sessions, for pixel-level models.',
    specs: [['Size', '1.61 GB'], ['Format', 'JPG + YOLO polygons'], ['Tasks', 'Instance segmentation'], ['Licence', 'CC BY 4.0']],
    treeTitle: 'Folder structure',
    tree: `GRAPE-Seg/
├── 2025_06_27/
│   ├── train/  images/ labels/
│   ├── val/
│   └── test/
├── … 6 sessions
└── data.yaml`,
    notes: ['About 2,400 frames sampled uniformly along 120 m of Row 2', 'Masks drawn with SALT; only visible pixels labelled', 'Per session: first 60% train, then 20% validation, 20% test', 'Same two-stage annotator and reviewer workflow'],
    code: `zenodo_get 10.5281/zenodo.22960131
yolo segment train data=GRAPE-Seg/data.yaml \\
     model=yolov8n-seg.pt imgsz=640`,
  },
];
