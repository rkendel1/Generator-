import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIdeas, triggerDeepDive, updateIdeaStatus, getDeepDiveVersions, restoreDeepDiveVersion, getAllIdeas, getIdeaById } from '@/lib/api';
import { IdeaCard } from '@/components/IdeaCard';
import type { Idea, IdeaStatus, DeepDiveVersion } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from 'react-markdown';

export default function IdeaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [deepDiveVersions, setDeepDiveVersions] = useState<DeepDiveVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [deepDiveLoading, setDeepDiveLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    // Fetch the idea directly by ID
    getIdeaById(id)
      .then((found) => {
        setIdea(found);
        fetchVersions(found.id);
        setLoading(false);
      })
      .catch(() => {
        setError('Idea not found');
        setLoading(false);
      });
  }, [id]);

  const fetchVersions = async (ideaId: string) => {
    try {
      const versions = await getDeepDiveVersions(ideaId);
      setDeepDiveVersions(versions);
    } catch {
      setDeepDiveVersions([]);
    }
  };

  const handleDeepDive = async () => {
    if (!idea) return;
    setDeepDiveLoading(true);
    await triggerDeepDive(idea.id);
    setDeepDiveLoading(false);
    // Refetch idea and versions
    setLoading(true);
    getIdeaById(idea.id).then((found) => {
      setIdea(found);
      setLoading(false);
    });
    fetchVersions(idea.id);
  };

  const handleStatusChange = async (id: string, newStatus: IdeaStatus) => {
    setStatusLoading(true);
    await updateIdeaStatus(id, newStatus);
    setStatusLoading(false);
    // Refetch idea
    setLoading(true);
    getIdeaById(id).then((found) => {
      setIdea(found);
      setLoading(false);
    });
  };

  const handleRestoreVersion = async (ideaId: string, versionNumber: number) => {
    await restoreDeepDiveVersion(ideaId, versionNumber);
    fetchVersions(ideaId);
    // Refetch idea
    setLoading(true);
    getIdeaById(ideaId).then((found) => {
      setIdea(found);
      setLoading(false);
    });
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!idea) return null;

  console.log('Loaded idea:', idea);

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Idea Details</TabsTrigger>
          <TabsTrigger value="history">Deep Dive Versions</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <div className="max-w-2xl mx-auto">
            <div className="mb-4">
              <Button variant="outline" onClick={() => navigate(-1)}>&larr; Back</Button>
            </div>
            <IdeaCard
              idea={{ ...idea, deep_dive_versions: deepDiveVersions }}
              onDeepDive={handleDeepDive}
              onStatusChange={handleStatusChange}
              onRestoreDeepDiveVersion={handleRestoreVersion}
            />
            {statusLoading && <div className="mt-2 text-xs text-slate-500">Updating status...</div>}
            {deepDiveLoading && <div className="mt-2 text-xs text-slate-500">Requesting deep dive...</div>}
          </div>
        </TabsContent>
        <TabsContent value="history">
          <div className="max-w-2xl mx-auto">
            <div className="mb-4">
              <Button variant="outline" onClick={() => navigate(-1)}>&larr; Back</Button>
            </div>
            {/* Deep dive version history UI can go here */}
            {deepDiveVersions.length === 0 ? (
              <div className="text-slate-500 text-sm">No deep dive versions yet.</div>
            ) : (
              <ul className="space-y-2">
                {deepDiveVersions.map(version => (
                  <li key={version.version_number} className="border rounded p-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Version {version.version_number}</span>
                      <Button size="sm" variant="secondary" onClick={() => handleRestoreVersion(idea.id, version.version_number)}>
                        Restore
                      </Button>
                    </div>
                    <div className="prose prose-sm mt-2">
                      <ReactMarkdown>{version.fields.raw || ''}</ReactMarkdown>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 