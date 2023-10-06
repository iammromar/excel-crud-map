import { Button, Table, Input } from "antd";

function TableComponent({
  maps,
  handleShowOnMap,
  deleted,
  handleEdit,
  updateFilter,
  filteredData,
  handleDelete,
  document,
  setModalText
}) {
  return (
    <Table
      style={{ maxWidth: "70%", minWidth: "50%" }}
      dataSource={filteredData}
      rowKey={(record) => record.id || Math.random()}
    >
      <Table.Column
        title={
          <div>
            ID
            <Input
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => updateFilter("id", e.target.value)}
              placeholder="Search ID"
            />
          </div>
        }
        dataIndex="id"
        sorter={(a, b) => b.id - a.id}
      />

      <Table.Column
        title={
          <div>
            Len
            <Input
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => updateFilter("len", e.target.value)}
              placeholder="Search Len"
            />
          </div>
        }
        dataIndex="len"
        sorter={(a, b) => b.len - a.len}
      />

      <Table.Column
        title={
          <div>
            Wkt
            <Input
              onChange={(e) => updateFilter("wkt", e.target.value)}
              placeholder="Search Wkt"
            />
          </div>
        }
        dataIndex="wkt"
      />

      <Table.Column
        title={
          <div>
            Status
            <Input
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => updateFilter("status", e.target.value)}
              placeholder="Search Status"
            />
          </div>
        }
        dataIndex="status"
        sorter={(a, b) => b.status - a.status}
      />
      <Table.Column
        title="Actions"
        key="actions"
        render={(text, record) => (
          <div style={{ display: "flex", gap: "10px" }}>
            <Button onClick={() => {
              setModalText(false)
              handleEdit(record)
            }}>
              <img className="icons" src={document} alt="" />
            </Button>
            <Button onClick={() => handleDelete(record.id)}>
              <img className="icons" src={deleted} alt="deleted" />
            </Button>
            <Button
              onClick={() => {
                handleShowOnMap(record);
              }}
            >
              <img className="icons" src={maps} alt="map" />
            </Button>
          </div>
        )}
      />
    </Table>
  );
}

export default TableComponent;