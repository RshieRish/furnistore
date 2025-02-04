'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/store/auth';
import { formatCurrency } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface PaymentStats {
  totalRevenue: number;
  recentPayments: Array<{
    _id: string;
    amount: number;
    status: string;
    createdAt: string;
    userId: {
      email: string;
      name: string;
    };
    estimateId: {
      requirements: string;
    };
  }>;
  paymentsByStatus: {
    pending: number;
    succeeded: number;
    failed: number;
  };
}

export default function FinanceDashboard() {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/payments/stats', {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching payment stats:', error);
      }
    };

    if (user?.isAdmin) {
      fetchStats();
    }
  }, [user]);

  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Unauthorized Access</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Financial Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold">
            {formatCurrency(stats?.totalRevenue || 0)}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-2">Successful Payments</h3>
          <p className="text-3xl font-bold text-green-600">
            {stats?.paymentsByStatus.succeeded || 0}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-2">Failed Payments</h3>
          <p className="text-3xl font-bold text-red-600">
            {stats?.paymentsByStatus.failed || 0}
          </p>
        </Card>
      </div>

      <Card className="mb-8">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Revenue Trend</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats?.recentPayments.map(p => ({
                  date: new Date(p.createdAt).toLocaleDateString(),
                  amount: p.amount,
                }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requirements</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.recentPayments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{payment.userId.name}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          payment.status === 'succeeded'
                            ? 'bg-green-100 text-green-800'
                            : payment.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {payment.estimateId.requirements}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
} 