import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

interface LegalDisclaimerProps {
    checked: boolean
    onCheckedChange: (checked: boolean) => void
}

export function LegalDisclaimer({ checked, onCheckedChange }: LegalDisclaimerProps) {
    return (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 mt-6">
            <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-4">
                    <div>
                        <h4 className="font-medium text-amber-900">Legal Responsibility & Truthfulness</h4>
                        <p className="text-sm text-amber-800 mt-1">
                            By submitting this case, you are making a public legal claim. False accusations can lead to
                            criminal defamation charges under IPC Section 499/500 and relevant IT Act provisions.
                        </p>
                    </div>

                    <div className="flex items-start space-x-3 pt-2">
                        <Checkbox
                            id="legal-affirmation"
                            checked={checked}
                            onCheckedChange={onCheckedChange}
                            className="mt-1 border-amber-400 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                        />
                        <Label
                            htmlFor="legal-affirmation"
                            className="text-sm leading-tight font-medium text-amber-900 cursor-pointer select-none"
                        >
                            I solemnly affirm that the information provided is true to the best of my knowledge.
                            I understand that I am legally responsible for this content and I agree to the
                            <span className="underline ml-1 cursor-pointer">Terms of Service</span>.
                        </Label>
                    </div>
                </div>
            </div>
        </div>
    )
}
