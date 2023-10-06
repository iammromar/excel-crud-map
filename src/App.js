import React, { useState, useRef, useEffect } from "react";

import { Button, Modal } from "antd";

import * as XLSX from "xlsx";

import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import WKT from "ol/format/WKT";
import { Style, Fill, Stroke, Circle } from "ol/style";

// components section
import Diagrams from "./components/Charts";
import TableComponent from "./components/Excel";
import ModalForm from "../src/components/Modal";

// assets section
import maps from "../src/assets/map.png";
import deleted from "../src/assets/remove.png";
import document from "../src/assets/docx.png";

import "./App.css";

function App() {
  const [fileData, setFileData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModalMap, setShowModalMap] = useState(false);
  const [showError, setShowError] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalText, setModalText] = useState(true);

  const [filteredData, setFilteredData] = useState(fileData);
  const [filters, setFilters] = useState({});
  const [formData, setFormData] = useState({ len: "", status: "" });

  const inputRef = useRef(null);

  const [map, setMap] = useState(null);
  const [mapTarget, setMapTarget] = useState(null);
  const mapRef = useRef(null);

  const [showPieChart, setShowPieChart] = useState(false);
  const [showBarChart, setShowBarChart] = useState(false);
  const [dataPieChart, setDataPieChart] = useState(null);
  const [dataBarChart, setDataBarChart] = useState(null);

  useEffect(() => {
    if (!map) {
      const initialMap = new Map({
        view: new View({
          center: [0, 0],
          zoom: 1,
        }),
        layers: [new TileLayer({ source: new OSM() })],
      });
      setMap(initialMap);
    }

    if (map && !mapTarget) {
      map.setTarget(mapRef.current);
      setMapTarget(mapRef.current);
    }
  }, [map, mapTarget]);

  const handleShowOnMap = (record) => {
    if (!record.wkt) {
      setShowModalMap(true);
    } else {
      const wktFormat = new WKT();
      const feature = wktFormat.readFeature(record.wkt, {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857",
      });

      const vectorSource = new VectorSource({ features: [feature] });
      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: new Style({
          fill: new Fill({ color: "red" }),
          stroke: new Stroke({ color: "red", width: 2 }),
          image: new Circle({ radius: 7, fill: new Fill({ color: "red" }) }),
        }),
      });

      map.addLayer(vectorLayer);
      map
        .getView()
        .fit(vectorSource.getExtent(), { padding: [50, 50, 50, 50] });
    }
  };

  useEffect(() => {
    const result = fileData.filter((record) => {
      for (let key in filters) {
        if (!filters[key]) continue;
        if (key === "len" && filters[key]) {
          const filterValue = filters[key];
          const recordValue = String(record[key]);

          if (filterValue.includes(".")) {
            const [filterInt, filterDec] = filterValue.split(".");

            if (recordValue.includes(".")) {
              const [recordInt, recordDec] = recordValue.split(".");
              if (filterInt === recordInt && recordDec.startsWith(filterDec)) {
                return true;
              }
            } else if (filterInt === recordValue) {
              return true;
            }

            return false;
          } else {
            if (recordValue.split(".")[0] === filterValue) {
              return true;
            }
            return false;
          }
        }
        if (key === "wkt") {
          if (record[key].includes(filters[key])) {
            continue;
          }

          const regex = new RegExp(
            `(${parseInt(filters[key], 10)}.[0-9]*)`,
            "g"
          );
          const match = record[key].match(regex);
          if (match && match.some((coord) => coord.startsWith(filters[key]))) {
            continue;
          }

          return false;
        }

        if (String(record[key]) !== filters[key]) {
          return false;
        }
      }
      return true;
    });

    result.sort((a, b) => b.id - a.id);

    setFilteredData(result);
  }, [fileData, filters]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      setFileData(jsonData);
    };

    reader.readAsArrayBuffer(file);
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAddOrEditRecord = () => {
    if (isNaN(formData.len) || formData.len === "" || formData.status === "") {
      setShowError(true);
      return;
    }

    if (editingId) {
      handleEditRecord(editingId);
      setEditingId(null);
    } else {
      const newId =
        fileData.length > 0
          ? Math.max(...fileData.map((item) => item.id)) + 1
          : 1;
      const newRecord = {
        id: newId,
        len: Number(formData.len),
        wkt: "",
        status: Number(formData.status),
      };
      console.log(newRecord);

      setFileData((prevData) => {
        const newData = [...prevData, newRecord];
        return newData;
      });
      setShowModal(false);
      setFormData({ len: "", status: "" });
    }
  };

  const handleEditRecord = (id) => {
    const updatedData = fileData.map((record) => {
      if (record.id === id) {
        return { ...record, ...formData };
      }
      return record;
    });
    setFileData(updatedData);
    setShowModal(false);
  };

  const handleEdit = (record) => {
    setFormData({
      len: record.len,
      status: record.status,
    });
    setEditingId(record.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Are you sure ?",
      content: "This transaction will not be undone",
      onOk: () => {
        setFileData((prevData) => prevData.filter((item) => item.id !== id));
      },
      onCancel: () => {
        console.log("Cancel");
      },
    });
  };

  const calculatePieData = () => {
    let dataForAnalysis = [...filteredData];
    let total = dataForAnalysis.length;

    const countStatus = (status) =>
      dataForAnalysis.filter((item) => item.status === status).length;

    setDataPieChart([
      {
        name: 0,
        value: countStatus(0),
        percent: ((countStatus(0) / total) * 100).toFixed(2),
      },
      {
        name: 1,
        value: countStatus(1),
        percent: ((countStatus(1) / total) * 100).toFixed(2),
      },
      {
        name: 2,
        value: countStatus(2),
        percent: ((countStatus(2) / total) * 100).toFixed(2),
      },
    ]);
  };

  const calculateBarData = () => {
    let dataForAnalysis = [...filteredData];

    let data = [
      { status: 0, sum: 0 },
      { status: 1, sum: 0 },
      { status: 2, sum: 0 },
    ];

    dataForAnalysis.forEach((item) => {
      if ([0, 1, 2].includes(item.status)) {
        data.find((x) => x.status === item.status).sum += Number(item.len);
      }
    });

    setDataBarChart(data);
  };

  return (
    <div className="app-container">
      <div className="buttons">
        <Button
          onClick={() => {
            inputRef.current.click();
          }}
        >
          Load Excel File
        </Button>
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          style={{ display: "none" }}
          ref={inputRef}
        />

        <Button
          onClick={() => {
            setShowModal(true);
            setModalText(true);
            setFormData({ len: "", status: "" })
          }}
        >
          Add New Data
        </Button>
      </div>

      <ModalForm
        showModal={showModal}
        handleAddRecord={handleAddOrEditRecord}
        setShowModal={setShowModal}
        setFormData={setFormData}
        formData={formData}
        setShowError={setShowError}
        showError={showError}
        modalText={modalText}
      />

      <div className="info-and-map">
        {fileData.length > 0 && (
          <TableComponent
            filteredData={filteredData}
            updateFilter={updateFilter}
            handleEdit={handleEdit}
            deleted={deleted}
            handleShowOnMap={handleShowOnMap}
            maps={maps}
            handleDelete={handleDelete}
            document={document}
            setModalText={setModalText}
          />
        )}

        <div
          className={
            fileData.length > 0 ? "map-container map-visible" : "map-container"
          }
          ref={
            mapRef
          }
        ></div>
      </div>

      <div className="diagrams-buttons">
        {fileData.length > 0 && (
          <Button
            onClick={() => {
              setShowPieChart(true);
              calculatePieData();
            }}
          >
            Analysis 1
          </Button>
        )}
        {fileData.length > 0 && (
          <Button
            onClick={() => {
              setShowBarChart(true);
              calculateBarData();
            }}
          >
            Analysis 2
          </Button>
        )}
      </div>

      <Diagrams
        showPieChart={showPieChart}
        showBarChart={showBarChart}
        dataPieChart={dataPieChart}
        dataBarChart={dataBarChart}
        setShowBarChart={setShowBarChart}
        setShowPieChart={setShowPieChart}
      />

      <Modal
        title="Error"
        open={showModalMap}
        onOk={() => setShowModalMap(false)}
        onCancel={() => setShowModalMap(false)}
      >
        <p>Not found</p>
      </Modal>
    </div>
  );
}

export default App;