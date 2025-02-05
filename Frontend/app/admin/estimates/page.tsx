"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/store/auth'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { adminApi } from '@/lib/api'
import { Estimate } from "@/types"

export default function EstimatesPage() {
  const router = useRouter()
  const { user, isHydrated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isHydrated) return;

    if (!user || !user.isAdmin) {
      router.replace('/login');
      return;
    }

    fetchEstimates();
  }, [user, isHydrated, router]);

  const fetchEstimates = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getEstimates();
      setEstimates(data);
    } catch (error) {
      console.error('Error loading estimates:', error);
      setError("Failed to load estimates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (estimateId: string, status: string) => {
    try {
      await adminApi.updateEstimate(estimateId, status);
      await fetchEstimates();
    } catch (error) {
      console.error('Error updating estimate:', error);
      setError("Failed to update estimate");
    }
  };

  const filteredEstimates = estimates.filter(estimate => {
    if (!searchQuery) return true;
    
    return (
      estimate.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      estimate.requirements?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      estimate.status?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (!isHydrated || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl mb-4">Loading Estimates...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Estimates Management</h1>
        <div className="text-sm text-gray-600">
          Total Estimates: {estimates.length}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Input
          type="search"
          placeholder="Search estimates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="md:w-1/3"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md p-2"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Estimates List */}
      <div className="space-y-6">
        {filteredEstimates.map((estimate) => (
          <Card key={estimate.id} className="p-6">
            <CardHeader>
              <CardTitle>Estimate Request</CardTitle>
              <h3 className="font-semibold">{estimate.userId?.email}</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Customer:</strong> {estimate.userId?.name ? `${estimate.userId.name} (${estimate.userId.email})` : 'Unknown User'}</p>
                <p><strong>Requirements:</strong> {estimate.requirements}</p>
                <p><strong>Price:</strong> ${estimate.price}</p>
                <p><strong>Status:</strong> {estimate.status}</p>
                <p><strong>Created:</strong> {new Date(estimate.createdAt).toLocaleDateString()}</p>
                {estimate.imageUrl && (
                  <div className="mt-4">
                    <p><strong>Reference Image:</strong></p>
                    <img
                      src={estimate.imageUrl}
                      alt="Estimate reference"
                      className="w-full h-40 object-cover rounded-md"
                    />
                  </div>
                )}
                <div className="mt-4">
                  <p><strong>Explanation:</strong></p>
                  <p className="text-sm text-gray-600">{estimate.explanation}</p>
                </div>
                <div className="mt-4">
                  <Select
                    onValueChange={(value) => handleUpdateStatus(estimate.id, value)}
                    defaultValue={estimate.status}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredEstimates.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No estimates found</p>
          </div>
        )}
      </div>
    </div>
  );
} 