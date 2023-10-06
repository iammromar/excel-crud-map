import { Modal, Input, Form, Select } from "antd";

function ModalForm({
  showModal,
  handleAddRecord,
  setShowModal,
  setFormData,
  formData,
  setShowError,
  showError,
  modalText
}) {
  const { Option } = Select;
  return (
    <Modal
      title={modalText ? "Add New" : "Update"}
      open={showModal}
      onCancel={() => setShowModal(false)}
      onOk={handleAddRecord}
    >
      <Form layout="vertical">
        <Form.Item label="Len" validateStatus={showError ? "error" : ""}>
          <Input
            value={formData.len}
            onChange={(e) => {
              setShowError(false);
              setFormData({ ...formData, len: Number(e.target.value) });
            }}
          />
        </Form.Item>
        <Form.Item
          label="Status"
          validateStatus={showError ? "error" : ""}
          help={showError ? "Fill in the fields correctly" : ""}
        >
          <Select
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: Number(value) })}
          >
            <Option value="0">0</Option>
            <Option value="1">1</Option>
            <Option value="2">2</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModalForm;