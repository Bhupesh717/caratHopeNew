'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Eye, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BespokeStatusBadge } from '@/components/bespoke/BespokeStatusBadge';
import { bespokeService } from '@/lib/api/bespoke';
import { BespokeOrder } from '@/types/bespoke';
import { format } from 'date-fns';

export default function AdminBespokeDashboard() {
  const [orders, setOrders] = useState<BespokeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // In real app, pass search/filter to API
        const response = await bespokeService.getAdminOrders();
        
        // Let's add some more mock data for the admin view
        const extraMocks: BespokeOrder[] = [
          {
            id: 'ORD-1002',
            customerId: 'CUST-2',
            customerName: 'Michael Brown',
            customerEmail: 'mike@example.com',
            customerPhone: '9876543210',
            jewelleryType: 'ring',
            metalType: 'Rose Gold',
            budgetRange: '₹75,000+',
            description: 'Simple elegant band with engraving.',
            inspirationImages: [],
            status: 'CAD Design',
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
          },
          {
            id: 'ORD-1003',
            customerId: 'CUST-3',
            customerName: 'Sarah Connor',
            customerEmail: 'sarah@example.com',
            customerPhone: '5551234567',
            jewelleryType: 'earrings',
            metalType: 'White Gold',
            budgetRange: '₹1,50,000+',
            description: 'Chandelier earrings with sapphires.',
            inspirationImages: [],
            status: 'Approved',
            createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
            updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          }
        ];
        
        setOrders([...response.data, ...extraMocks]);
      } catch (error) {
        console.error("Failed to fetch admin orders", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 md:p-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-foreground">Bespoke Requests</h1>
          <p className="text-muted-foreground mt-1">Manage all custom jewellery orders and quotations.</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Search by Order ID or Customer Name..." 
            className="pl-10 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="text-muted-foreground w-4 h-4 hidden md:block" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px] bg-background">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Reviewing">Reviewing</SelectItem>
              <SelectItem value="Quoted">Quoted</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="CAD Design">CAD Design</SelectItem>
              <SelectItem value="In Production">In Production</SelectItem>
              <SelectItem value="Shipped">Shipped</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex justify-center">
            <div className="animate-pulse w-8 h-8 rounded-full border-4 border-bespoke-gold border-t-transparent" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Jewellery Details</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Date Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No bespoke orders found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order, index) => (
                  <TableRow key={order.id} className="group">
                    <TableCell className="font-mono font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{order.customerName}</div>
                        <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="capitalize font-medium">{order.jewelleryType}</div>
                      <div className="text-xs text-muted-foreground">{order.metalType}</div>
                    </TableCell>
                    <TableCell>{order.budgetRange}</TableCell>
                    <TableCell>{format(new Date(order.createdAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <BespokeStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/bespoke-orders/${order.id}`}>
                        <Button variant="ghost" size="sm" className="text-bespoke-gold hover:text-bespoke-gold-dark hover:bg-bespoke-gold/10">
                          <Eye className="w-4 h-4 mr-2" /> View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
