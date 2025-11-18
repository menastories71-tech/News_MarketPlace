import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import api from '../services/api';
import { ArrowLeft, RefreshCw, Send, CheckCircle, XCircle } from 'lucide-react';

const AiArticleGenerationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchArticle();
  }, [id, isAuthenticated, navigate]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/ai-generated-articles/${id}`);
      setArticle(response.data.article);
    } catch (error) {
      console.error('Error fetching article:', error);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const generateArticle = async () => {
    try {
      setGenerating(true);
      setError('');
      const response = await api.post(`/ai-generated-articles/${id}/generate`, {
        additional_prompt: additionalPrompt
      });
      setArticle(response.data.article);
      setAdditionalPrompt(''); // Clear the prompt after generation
    } catch (error) {
      console.error('Error generating article:', error);
      // Check if it's a validation error with a specific message
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          'Failed to generate article. Please try again.';
      setError(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const finalizeArticle = async () => {
    try {
      setFinalizing(true);
      setError('');
      await api.post(`/ai-generated-articles/${id}/finalize`);
      // Redirect to articles page
      navigate('/articles');
    } catch (error) {
      console.error('Error finalizing article:', error);
      setError('Failed to submit article for review. Please try again.');
    } finally {
      setFinalizing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'text-yellow-600 bg-yellow-50';
      case 'pending': return 'text-blue-600 bg-blue-50';
      case 'approved': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <UserHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 mx-auto mb-4 border-4 border-[#1976D2] border-t-transparent"></div>
            <p className="text-lg text-[#757575]">Loading article...</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <UserHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4 text-[#212121]">Article Not Found</h2>
            <p className="text-[#757575] mb-6">The article you're looking for doesn't exist or you don't have permission to view it.</p>
            <button
              onClick={() => navigate('/articles')}
              className="px-6 py-3 bg-[#1976D2] text-white rounded-lg hover:bg-[#0D47A1] transition-colors"
            >
              Back to Articles
            </button>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <UserHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/articles')}
            className="flex items-center gap-2 text-[#1976D2] hover:text-[#0D47A1] mb-4"
          >
            <ArrowLeft size={20} />
            Back to Articles
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#212121] mb-2">AI Article Generation</h1>
              <p className="text-[#757575]">Review and refine your AI-generated article</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(article.status)}`}>
              {getStatusIcon(article.status)}
              {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Article Info */}
        <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-[#212121] mb-2">Story Type</h3>
              <p className="text-[#757575] capitalize">{article.story_type}</p>
            </div>
            <div>
              <h3 className="font-semibold text-[#212121] mb-2">Publication</h3>
              <p className="text-[#757575]">{article.publication?.publication_name || 'Not Assigned'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-[#212121] mb-2">Created</h3>
              <p className="text-[#757575]">{new Date(article.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="font-semibold text-[#212121] mb-2">File</h3>
              <p className="text-[#757575]">
                {article.uploaded_file_path ? 'Document uploaded' : 'No document uploaded'}
              </p>
            </div>
          </div>
        </div>

        {/* Generation Section */}
        {!article.generated_content && (
          <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-6 mb-6">
            <h2 className="text-xl font-semibold text-[#212121] mb-4">Generate Article</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">
                  Additional Instructions (Optional)
                </label>
                <textarea
                  value={additionalPrompt}
                  onChange={(e) => setAdditionalPrompt(e.target.value)}
                  placeholder="Add any specific instructions or requirements for the AI..."
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] min-h-[100px] resize-vertical"
                  disabled={generating}
                />
              </div>

              <button
                onClick={generateArticle}
                disabled={generating}
                className="flex items-center gap-2 px-6 py-3 bg-[#4CAF50] text-white rounded-lg hover:bg-[#388E3C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Generating Article...
                  </>
                ) : (
                  <>
                    <RefreshCw size={18} />
                    Generate Article
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Generated Content */}
        {article.generated_content && (
          <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-6 mb-6">
            <h2 className="text-xl font-semibold text-[#212121] mb-4">Generated Article</h2>

            <div className="prose max-w-none">
              <div
                className="text-[#212121] leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: article.generated_content }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {article.generated_content && article.status === 'draft' && (
          <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-6">
            <h2 className="text-xl font-semibold text-[#212121] mb-4">Actions</h2>

            <div className="space-y-4">
              {/* Regenerate Section */}
              <div className="border-t border-[#E0E0E0] pt-4">
                <h3 className="font-semibold text-[#212121] mb-2">Regenerate with Additional Instructions</h3>
                <div className="space-y-3">
                  <textarea
                    value={additionalPrompt}
                    onChange={(e) => setAdditionalPrompt(e.target.value)}
                    placeholder="Add specific changes or additional requirements..."
                    className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] min-h-[80px] resize-vertical"
                    disabled={generating}
                  />
                  <button
                    onClick={generateArticle}
                    disabled={generating || !additionalPrompt.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-[#FF9800] text-white rounded-lg hover:bg-[#F57C00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={16} />
                        Regenerate Article
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Finalize Section */}
              <div className="border-t border-[#E0E0E0] pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-[#212121] mb-1">Ready to Submit?</h3>
                    <p className="text-sm text-[#757575]">Submit this article for admin review</p>
                  </div>
                  <button
                    onClick={finalizeArticle}
                    disabled={finalizing}
                    className="flex items-center gap-2 px-6 py-3 bg-[#1976D2] text-white rounded-lg hover:bg-[#0D47A1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {finalizing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Submit for Review
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {article.status === 'pending' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              Your article has been submitted for review. You will be notified once it's approved or if any changes are needed.
            </p>
          </div>
        )}

        {article.status === 'approved' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">
              Congratulations! Your article has been approved and is now live.
            </p>
          </div>
        )}

        {article.status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              Your article was not approved. Please check your email for feedback and resubmit.
            </p>
          </div>
        )}
      </div>

      <UserFooter />
    </div>
  );
};

export default AiArticleGenerationPage;