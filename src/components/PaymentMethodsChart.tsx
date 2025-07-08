import React from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface PaymentMethodData {
  name: string
  value: number
  amount: number
  color: string
}

interface PaymentMethodsChartProps {
  data: PaymentMethodData[]
  height?: number
}

const PaymentMethodsChart: React.FC<PaymentMethodsChartProps> = ({ 
  data, 
  height = 300 
}) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-1">{data.name}</p>
          <p className="text-sm text-gray-600">
            Transactions: {data.value}%
          </p>
          <p className="text-sm text-gray-600">
            Montant: {data.amount.toLocaleString()} XOF
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry: any) => (
              <span style={{ color: entry.color }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend with amounts */}
      <div className="mt-4 grid grid-cols-1 gap-2">
        {data.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-2 bg-gray-50 rounded"
          >
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium">{item.name}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">{item.value}%</div>
              <div className="text-xs text-gray-600">
                {item.amount.toLocaleString()} XOF
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default PaymentMethodsChart