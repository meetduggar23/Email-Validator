import EmailValidationCard from '@/components/EmailValidationCard'

export default function ValidateEmail() {
  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Validate Email</h1>
        <p className="text-muted-foreground mt-1">Check any email address for syntax, domain, and deliverability</p>
      </div>
      <EmailValidationCard />
    </div>
  )
}
