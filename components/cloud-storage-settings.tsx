import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Cloud, Database, HardDrive, Upload } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ConfigStatus {
  isValid: boolean
  missing: string[]
}

interface MigrationResult {
  success: boolean
  migratedCount: number
  errors: string[]
}

export function CloudStorageSettings() {
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null)
  const [testStatus, setTestStatus] = useState<{ success: boolean; error?: string } | null>(null)
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'config' | 'migration'>('config')

  const checkConfiguration = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/migration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify' }),
      })
      const result = await response.json()
      setConfigStatus(result)
    } catch (error) {
      console.error('Error checking configuration:', error)
      setConfigStatus({ isValid: false, missing: ['Configuration check failed'] })
    } finally {
      setIsLoading(false)
    }
  }

  const testCloudStorage = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/migration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test' }),
      })
      const result = await response.json()
      setTestStatus(result)
    } catch (error) {
      console.error('Error testing cloud storage:', error)
      setTestStatus({ success: false, error: 'Test request failed' })
    } finally {
      setIsLoading(false)
    }
  }

  const migrateData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/migration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'migrate' }),
      })
      const result = await response.json()
      setMigrationResult(result)
    } catch (error) {
      console.error('Error migrating data:', error)
      setMigrationResult({ 
        success: false, 
        migratedCount: 0, 
        errors: ['Migration request failed'] 
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkConfiguration()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Cloud className="w-6 h-6" />
        <h2 className="text-2xl font-bold">Cloud Storage Settings</h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'config' ? 'default' : 'outline'}
          onClick={() => setActiveTab('config')}
        >
          Configuration
        </Button>
        <Button
          variant={activeTab === 'migration' ? 'default' : 'outline'}
          onClick={() => setActiveTab('migration')}
        >
          Data Migration
        </Button>
      </div>

      {activeTab === 'config' && (
        <div className="space-y-4">
          {/* Configuration Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Configuration Status
              </CardTitle>
              <CardDescription>
                Check if AWS S3 and database are properly configured
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {configStatus && (
                <div className="flex items-center gap-2">
                  {configStatus.isValid ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Configured
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Missing Configuration
                    </Badge>
                  )}
                </div>
              )}

              {configStatus && !configStatus.isValid && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Missing environment variables: {configStatus.missing.join(', ')}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={checkConfiguration} 
                  disabled={isLoading}
                  variant="outline"
                >
                  {isLoading ? 'Checking...' : 'Check Configuration'}
                </Button>
                
                {configStatus?.isValid && (
                  <Button 
                    onClick={testCloudStorage} 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Testing...' : 'Test Connection'}
                  </Button>
                )}
              </div>

              {testStatus && (
                <Alert className={testStatus.success ? 'border-green-500' : 'border-red-500'}>
                  {testStatus.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <AlertDescription>
                    {testStatus.success 
                      ? 'Cloud storage is working correctly!' 
                      : `Test failed: ${testStatus.error}`
                    }
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Environment Variables Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Required Environment Variables</CardTitle>
              <CardDescription>
                Add these to your .env.local file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-4 rounded-md font-mono text-sm space-y-1">
                <div># AWS S3 Configuration</div>
                <div>AWS_ACCESS_KEY_ID=your_access_key</div>
                <div>AWS_SECRET_ACCESS_KEY=your_secret_key</div>
                <div>AWS_REGION=us-east-1</div>
                <div>S3_BUCKET_NAME=your-bucket-name</div>
                <div className="mt-2"># Database (choose one)</div>
                <div>MONGODB_URI=mongodb://localhost:27017/english-app</div>
                <div># OR</div>
                <div>DATABASE_URL=postgresql://user:pass@localhost:5432/db</div>
                <div className="mt-2"># Enable cloud storage</div>
                <div>NEXT_PUBLIC_USE_CLOUD_STORAGE=true</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'migration' && (
        <div className="space-y-4">
          {/* Migration Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Data Migration
              </CardTitle>
              <CardDescription>
                Migrate existing conversations from local storage to cloud storage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4" />
                  <span className="text-sm">Local Storage</span>
                </div>
                <div className="flex-1 h-2 bg-gray-200 rounded">
                  <div className="h-2 bg-blue-500 rounded w-1/2"></div>
                </div>
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4" />
                  <span className="text-sm">Cloud Storage</span>
                </div>
              </div>

              <Button 
                onClick={migrateData} 
                disabled={isLoading || !configStatus?.isValid}
                className="w-full"
              >
                {isLoading ? 'Migrating...' : 'Start Migration'}
              </Button>

              {!configStatus?.isValid && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please configure cloud storage before migrating data.
                  </AlertDescription>
                </Alert>
              )}

              {migrationResult && (
                <Alert className={migrationResult.success ? 'border-green-500' : 'border-yellow-500'}>
                  {migrationResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  <AlertDescription>
                    <div>
                      Migration completed: {migrationResult.migratedCount} conversations migrated
                    </div>
                    {migrationResult.errors.length > 0 && (
                      <div className="mt-2">
                        <strong>Errors:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {migrationResult.errors.map((error, index) => (
                            <li key={index} className="text-sm">{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Migration Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Migration Process</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Configure AWS S3 and database credentials</li>
                <li>Test the connection to ensure everything works</li>
                <li>Run the migration to move existing conversations to cloud</li>
                <li>Audio files will be uploaded to S3</li>
                <li>Conversation data will be saved to the database</li>
                <li>Local storage will remain as backup</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
