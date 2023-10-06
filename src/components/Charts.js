import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Modal } from "antd";

function Diagrams({
  showPieChart,
  showBarChart,
  dataPieChart,
  dataBarChart,
  setShowBarChart,
  setShowPieChart,
}) {
  return (
    <div className="diagrams">
      <Modal
        title="Pie Chart Analysis"
        open={showPieChart}
        onCancel={() => setShowPieChart(false)}
        footer={null}
        width={450}
      >
        <PieChart width={400} height={400}>
          <Pie
            data={dataPieChart}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#fce305"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${percent}%`}
          >
            <Cell key={`cell-0`} fill="#cf0a11" />
            <Cell key={`cell-1`} fill="#fce305" />
            <Cell key={`cell-2`} fill="#da09ed" />
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </Modal>

      <Modal
        title="Vertical Chart Analysis"
        open={showBarChart}
        onCancel={() => setShowBarChart(false)}
        footer={null}
        width={650}
      >
        <BarChart
          width={600}
          height={300}
          data={dataBarChart}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="status" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="sum" fill="#fce305" />
        </BarChart>
      </Modal>
    </div>
  );
}

export default Diagrams;