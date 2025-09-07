import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

const contactSubmissionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  userAgent: z.string().optional(),
  timestamp: z.date().optional(),
});

type ContactSubmission = z.infer<typeof contactSubmissionSchema> & {
  id: string;
  timestamp: Date;
  status: 'new' | 'read' | 'responded';
};

// In-memory storage for demo (replace with actual database)
const contactSubmissions: ContactSubmission[] = [];

// Email notification function (replace with actual email service)
async function sendEmailNotification(submission: ContactSubmission) {
  console.log('📧 New contact form submission:', {
    id: submission.id,
    name: submission.name,
    email: submission.email,
    subject: submission.subject,
    message: submission.message,
    timestamp: submission.timestamp,
  });
  
  // TODO: Integrate with actual email service (SendGrid, Nodemailer, etc.)
  // Example with SendGrid:
  // await sgMail.send({
  //   to: 'your-email@domain.com',
  //   from: 'noreply@yourapp.com',
  //   subject: `New Contact Form: ${submission.subject}`,
  //   html: `
  //     <h2>New Contact Form Submission</h2>
  //     <p><strong>Name:</strong> ${submission.name}</p>
  //     <p><strong>Email:</strong> ${submission.email}</p>
  //     <p><strong>Subject:</strong> ${submission.subject}</p>
  //     <p><strong>Message:</strong></p>
  //     <p>${submission.message.replace(/\n/g, '<br>')}</p>
  //     <p><strong>Submitted:</strong> ${submission.timestamp.toISOString()}</p>
  //   `
  // });
}

export const submitContactProcedure = publicProcedure
  .input(contactSubmissionSchema)
  .mutation(async ({ input }: { input: z.infer<typeof contactSubmissionSchema> }) => {
    const submission: ContactSubmission = {
      ...input,
      id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      status: 'new',
    };

    // Store submission
    contactSubmissions.push(submission);

    // Send email notification
    try {
      await sendEmailNotification(submission);
    } catch (error) {
      console.error('Failed to send email notification:', error);
      // Don't fail the submission if email fails
    }

    return {
      success: true,
      id: submission.id,
      message: 'Your message has been submitted successfully. We\'ll get back to you soon!',
    };
  });

export const getContactSubmissionsProcedure = publicProcedure
  .query(() => {
    return contactSubmissions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  });

export const markContactAsReadProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }: { input: { id: string } }) => {
    const submission = contactSubmissions.find(s => s.id === input.id);
    if (submission) {
      submission.status = 'read';
    }
    return { success: true };
  });