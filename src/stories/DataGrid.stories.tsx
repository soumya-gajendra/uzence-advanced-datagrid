import type { Meta, StoryObj } from '@storybook/react';
import { DataGrid } from '../DataGrid';

const meta = {
  title: 'Uzence/DataGrid',
  component: DataGrid,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DataGrid>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {},
};
export const DashboardContext: Story = {
  render: () => (
    <div className="p-10 bg-gray-900 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">HR Dashboard</h1>
        <div className="bg-white rounded-xl shadow-2xl p-6 h-[600px] flex flex-col">
          <DataGrid />
        </div>
      </div>
    </div>
  ),
};