import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import type { Database } from "@/lib/database.types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ExternalLink } from "lucide-react"

type Customer = Database['public']['Tables']['customers']['Row']
type SkillCheck = Database['public']['Tables']['skill_checks']['Row']
type CustomerNote = Database['public']['Tables']['customer_notes']['Row']

interface CustomerDetailsProps {
  customerId: number
  onBack: () => void
}

export default function CustomerDetails({ customerId, onBack }: CustomerDetailsProps) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [skillChecks, setSkillChecks] = useState<SkillCheck[]>([])
  const [notes, setNotes] = useState<CustomerNote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomerData()
  }, [customerId])

  const fetchCustomerData = async () => {
    setLoading(true)
    
    // Fetch customer info
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single()

    if (customerError) {
      console.error('Error fetching customer:', customerError)
    } else {
      setCustomer(customerData)
    }

    // Fetch skill checks
    const { data: skillData, error: skillError } = await supabase
      .from('skill_checks')
      .select('*')
      .eq('customer_id', customerId)
      .order('imported_at', { ascending: false })

    if (skillError) {
      console.error('Error fetching skill checks:', skillError)
    } else {
      setSkillChecks(skillData || [])
    }

    // Fetch notes
    const { data: notesData, error: notesError } = await supabase
      .from('customer_notes')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (notesError) {
      console.error('Error fetching notes:', notesError)
    } else {
      setNotes(notesData || [])
    }

    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "in progress":
        return "bg-teal-100 text-teal-800"
      case "new":
        return "bg-red-100 text-red-800"
      case "completion":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex-1 p-8 overflow-auto bg-white">
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Loading customer details...</p>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex-1 p-8 overflow-auto bg-white">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
        <p className="text-red-600">Customer not found</p>
      </div>
    )
  }

  return (
    <div className="flex-1 p-8 overflow-auto bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{customer.name}</h1>
            <p className="text-gray-500">Customer #{customer.customer_number}</p>
          </div>
          <Badge className={`capitalize text-sm px-3 py-1 ${getStatusBadge(customer.status)}`}>
            {customer.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Age</p>
                <p className="font-medium">{customer.age || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Prefecture</p>
                <p className="font-medium">{customer.prefecture || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Occupation</p>
                <p className="font-medium">{customer.occupation || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nail Technician Experience</p>
                <p className="font-medium">{customer.nail_technician_experience || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Application Date</p>
                <p className="font-medium">{customer.application_date || 'N/A'}</p>
              </div>
              {customer.google_drive_url && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Documents</p>
                  <a
                    href={customer.google_drive_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-700 flex items-center text-sm"
                  >
                    Open Google Drive
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Skill Checks and Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skill Checks */}
          <Card>
            <CardHeader>
              <CardTitle>Skill Check Results</CardTitle>
            </CardHeader>
            <CardContent>
              {skillChecks.length === 0 ? (
                <p className="text-gray-500 text-sm">No skill checks recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {skillChecks.map((check) => (
                    <div key={check.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-lg">
                            Total Score: {check.total_score || 'N/A'}
                          </p>
                          {check.rank && (
                            <Badge className="mt-1">{check.rank}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(check.imported_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Filing</p>
                          <p className="font-medium">{check.filing_score || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Care</p>
                          <p className="font-medium">{check.care_score || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Color</p>
                          <p className="font-medium">{check.color_score || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Art</p>
                          <p className="font-medium">{check.art_score || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Counseling</p>
                          <p className="font-medium">{check.counseling_score || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total Time</p>
                          <p className="font-medium">{check.total_time || '-'}</p>
                        </div>
                      </div>
                      
                      {check.counseling_comment && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-gray-500">Counseling Comment</p>
                          <p className="text-sm mt-1">{check.counseling_comment}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {notes.length === 0 ? (
                <p className="text-gray-500 text-sm">No notes yet.</p>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note.id} className="border-l-4 border-teal-600 pl-4 py-2">
                      <p className="text-sm">{note.note_content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(note.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}