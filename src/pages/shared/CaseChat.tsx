import { useParams, Link, useLocation } from 'react-router-dom';
import { mockCases } from '@/lib/mock-data';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { User, Scale, Send, Upload, ArrowLeft, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/StatusBadge';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const CaseChat = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const caseData = mockCases.find((c) => c.id === id);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAdmin = location.pathname.startsWith('/admin');
  const isLawyer = user?.role === 'lawyer';

  const backLink = isAdmin
    ? `/admin/cases/${id}`
    : isLawyer
      ? `/lawyer/cases/${id}`
      : `/app/cases/${id}`;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [caseData?.messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    toast({ title: 'Message sent', description: message.slice(0, 50) + '...' });
    setMessage('');
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      toast({ title: 'File attached', description: `${files.length} file(s) uploaded.` });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const Layout = isAdmin ? AdminLayout : DashboardLayout;

  if (!caseData) return (
    <Layout>
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Case not found.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to={backLink}>Go Back</Link>
        </Button>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-80px)]">
        {/* Top bar */}
        <div className="shrink-0 flex items-center gap-3 pb-3 border-b mb-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link to={backLink}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm font-semibold truncate">{caseData.title}</h1>
              <StatusBadge status={caseData.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {caseData.caseNumber} • {caseData.userName}
              {caseData.lawyerName && ` • ${caseData.lawyerName}`}
            </p>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {caseData.messages.length} messages
          </span>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto space-y-3 px-1">
          {caseData.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">No messages yet. Start the conversation.</p>
            </div>
          ) : (
            <>
              {caseData.messages.map((m) => {
                const isOwnMessage = isAdmin
                  ? false
                  : (isLawyer ? m.senderRole === 'lawyer' : m.senderRole === 'user');

                return (
                  <div key={m.id} className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                    <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                      m.senderRole === 'lawyer' ? 'bg-gold/20 text-gold' : 'bg-muted text-muted-foreground'
                    }`}>
                      {m.senderRole === 'lawyer' ? <Scale className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                    </div>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                      isOwnMessage
                        ? 'bg-navy text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                      <p className="text-[11px] font-medium opacity-60 mb-0.5">{m.senderName}</p>
                      <p className="leading-relaxed">{m.content}</p>
                      <p className="text-[10px] opacity-40 mt-1">
                        {new Date(m.timestamp).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input area */}
        {!isAdmin && (
          <div className="shrink-0 border-t pt-3 mt-3">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="hidden"
                onChange={handleUpload}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button size="icon" className="h-9 w-9 shrink-0" onClick={handleSend} disabled={!message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Admin read-only notice */}
        {isAdmin && (
          <div className="shrink-0 border-t pt-3 mt-3">
            <p className="text-xs text-center text-muted-foreground py-2">
              Admin view — read-only access to case communication
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CaseChat;
