import React, { useState, useEffect, useRef } from 'react';
import { Printer, FileText, Check, Trash2, QrCode, Clock, AlertCircle, X } from 'lucide-react';
import QRCode from 'react-qr-code';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getToken, getShopId } from '../utils/auth';
import { io, Socket } from 'socket.io-client';

// Types
interface PrintJob {
  id: string;
  fileType: string;
  printType: 'bw' | 'color';
  printSide: 'single' | 'double';
  copies: number;
  token: string;
  status: 'pending' | 'completed' | 'expired';
  uploadTime: Date;
  fileName?: string;
  fileSize?: number;
}

// QR Code Modal Component
const QRCodeModal = ({ isOpen, onClose, shop }: { isOpen: boolean; onClose: () => void; shop: any }) => {
  const qrCanvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shop && qrCanvasRef.current) {
      qrCanvasRef.current.innerHTML = "";
      const img = new Image();
      img.src = shop.qr_code;
      img.style.width = '300px';
      img.style.height = '300px';
      qrCanvasRef.current.appendChild(img);
    }
  }, [isOpen, shop]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Your Shop's QR Code</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Close</span>
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex flex-col items-center">
          <div ref={qrCanvasRef} className="bg-white p-4 rounded-lg border border-gray-200"></div>
          <p className="mt-4 text-sm text-gray-500 text-center">
            Display this QR code in your shop for customers to scan and upload their files.
          </p>
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">Shop ID: {shop._id}</p>
            <p className="text-sm font-medium">{shop.name}</p>
          </div>
          <button
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            onClick={() => {
              const link = document.createElement('a');
              link.href = shop.qr_code;
              link.download = `${shop.name}_QRCode.png`;
              link.click();
              toast.success('QR Code downloaded successfully');
            }}
          >
            Download QR Code
          </button>
        </div>
      </div>
    </div>
  );
};

const ShopDashboard = () => {
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [shop, setShop] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'expired'>('pending');
  const [showQRModal, setShowQRModal] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const socket = io('http://localhost:5000', {
      auth: { token: getToken() }
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('newPrintJob', (newJob: PrintJob) => {
      setPrintJobs((prevJobs) => [...prevJobs, {
        id: newJob.id,
        fileType: newJob.fileType || (newJob.fileName ? newJob.fileName.split('.').pop() : 'unknown'),
        printType: newJob.printType,
        printSide: newJob.printSide,
        copies: newJob.copies,
        token: newJob.token,
        status: newJob.status,
        uploadTime: new Date(newJob.uploadTime),
        fileName: newJob.fileName,
        fileSize: newJob.fileSize
      }]);
      toast.success('New print job received!');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Fetch shop details
  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/shop/${getShopId()}`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch shop details');
        }
        const shop = await response.json();
        setShop(shop);
      } catch (error) {
        toast.error('Failed to fetch shop details');
      }
    };

    fetchShopDetails();
  }, []);

  // Fetch initial print jobs
  useEffect(() => {
    const fetchPrintJobs = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/printjobs/prints/${getShopId()}`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch print jobs');
        }
        const jobs = await response.json();
        console.log(jobs);
        setPrintJobs(Array.isArray(jobs) ? jobs.map(job => ({
          id: job._id,
          fileType: job.fileName ? job.fileName.split('.').pop() : 'unknown', // Derive fileType from fileName
          printType: job.print_type,
          printSide: job.print_side,
          copies: job.copies,
          token: job.token_number,
          status: job.status,
          uploadTime: new Date(job.uploaded_at),
          fileName: job.fileName,
          fileSize: job.fileSize // Include fileSize from backend
        })) : []);
        setIsLoading(false);
      } catch (error) {
        toast.error('Failed to fetch print jobs');
        setIsLoading(false);
      }
    };

    fetchPrintJobs();
  }, []);

  const handleMarkAsCompleted = async (jobId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/printjobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status: 'completed' }),
      });
      if (!response.ok) {
        throw new Error('Failed to update print job status');
      }
      const updatedJob = await response.json();
      setPrintJobs(prevJobs =>
        prevJobs.map(job =>
          job.id === jobId ? {
            id: updatedJob._id,
            fileType: updatedJob.fileName ? updatedJob.fileName.split('.').pop() : 'unknown',
            printType: updatedJob.print_type,
            printSide: updatedJob.print_side,
            copies: updatedJob.copies,
            token: updatedJob.token_number,
            status: updatedJob.status,
            uploadTime: new Date(updatedJob.uploaded_at),
            fileName: updatedJob.fileName,
            fileSize: updatedJob.fileSize
          } : job
        )
      );
      toast.success('Print job marked as completed');
    } catch (error) {
      toast.error('Failed to update print job status');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/printjobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete print job');
      }
      setPrintJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      toast.success('Print job deleted');
    } catch (error) {
      toast.error('Failed to delete print job');
    }
  };

  const filteredJobs = printJobs.filter(job => job.status === activeTab);

  const getUploadTimeDisplay = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 24 * 60) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };

  const getFileIcon = (fileType: string) => {
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="h-3 w-3 mr-1" />
            Completed
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Expired
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-2 rounded-lg mr-3">
                    <Printer className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">Print Jobs Dashboard</h1>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your print jobs and track customer requests
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <button
                  onClick={() => setShowQRModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Show Shop QR Code
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending Jobs</p>
                  <h3 className="text-xl font-bold text-gray-900">
                    {printJobs.filter(job => job.status === 'pending').length}
                  </h3>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Completed Jobs</p>
                  <h3 className="text-xl font-bold text-gray-900">
                    {printJobs.filter(job => job.status === 'completed').length}
                  </h3>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Expired Jobs</p>
                  <h3 className="text-xl font-bold text-gray-900">
                    {printJobs.filter(job => job.status === 'expired').length}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Updated Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {['pending', 'completed', 'expired'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as 'pending' | 'completed' | 'expired')}
                    className={`${
                      activeTab === tab
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs ${
                      activeTab === tab ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {printJobs.filter(job => job.status === tab).length}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Print Jobs List */}
            <div className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                    <Printer className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="mt-3 text-sm font-medium text-gray-900">No {activeTab} print jobs</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {activeTab === 'pending'
                      ? "You don't have any pending print jobs at the moment."
                      : activeTab === 'completed'
                      ? "You haven't completed any print jobs yet."
                      : "You don't have any expired print jobs."}
                  </p>
                </div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {filteredJobs.map((job) => (
                      <li key={job.id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                {getFileIcon(job.fileType)}
                              </div>
                              <div className="ml-4">
                                <div className="flex items-center">
                                  <h4 className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                    {job.fileName || 'Unknown File'}
                                  </h4>
                                  <span className="ml-2 flex-shrink-0">
                                    {getStatusBadge(job.status)}
                                  </span>
                                </div>
                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                  <span className="truncate">
                                    {(job.fileSize ? (job.fileSize / (1024 * 1024)).toFixed(1) : 'N/A')} MB • 
                                    {job.printType === 'bw' ? ' Black & White' : ' Color'} • 
                                    {job.printSide === 'single' ? ' Single-sided' : ' Double-sided'} • 
                                    {job.copies} {job.copies === 1 ? 'copy' : 'copies'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="text-sm font-medium text-gray-900 mb-1">
                                Token: <span className="text-primary">{job.token}</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {getUploadTimeDisplay(job.uploadTime)}
                              </div>
                            </div>
                          </div>
                          {job.status === 'pending' && (
                            <div className="mt-4 flex justify-end space-x-3">
                              <button
                                onClick={() => handleMarkAsCompleted(job.id)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Mark as Completed
                              </button>
                              <button
                                onClick={() => handleDeleteJob(job.id)}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        shop={shop}
      />
    </>
  );
};

export default ShopDashboard;