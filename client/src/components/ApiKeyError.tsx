import React from 'react';
import { AlertTriangle, RefreshCw, Key, Clock, AlertCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ApiKeyErrorProps {
  message: string;
  onRetry: () => void;
}

export default function ApiKeyError({ message, onRetry }: ApiKeyErrorProps) {
  return (
    <div className="mt-8 animate-in fade-in duration-500 mx-auto max-w-lg">
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 rounded-xl overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-white">
          <div className="flex items-center">
            <div className="bg-white/20 p-2 rounded-full mr-3">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold">API Authentication Error</h2>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="mb-5 text-amber-800 dark:text-amber-300 text-center font-medium border-b border-amber-200 dark:border-amber-800 pb-4">
            {message}
          </div>
          
          <div className="space-y-4">
            <div className="bg-white/80 dark:bg-slate-800/80 rounded-lg border border-amber-200 dark:border-amber-800 shadow-inner p-5">
              <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                Possible Solutions
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <Key className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">Verify that your OpenWeatherMap API key is correct</p>
                </div>
                
                <div className="flex items-start">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">New API keys may take up to 24 hours to activate after creation</p>
                </div>
                
                <div className="flex items-start">
                  <RefreshCw className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">Check that you haven't exceeded your API usage limits</p>
                </div>
                
                <div className="flex items-start">
                  <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">Ensure the API key has the necessary permissions</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={onRetry} 
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-none shadow-md"
                size="lg"
              >
                <RefreshCw className="mr-2 h-4 w-4 animate-spin-slow" />
                Retry Connection
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}