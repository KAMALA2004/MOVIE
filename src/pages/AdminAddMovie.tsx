import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface MovieFormData {
  imdb_id: string;
  title: string;
  year: number | null;
  genre: string;
  director: string;
  plot: string;
  poster: string;
  imdb_rating: number | null;
  runtime: string;
  rated: string;
  released: string;
  language: string;
  country: string;
  actors: string;
  writer: string;
  awards: string;
  box_office: string;
  production: string;
  website: string;
}

export const AdminAddMovie: React.FC = () => {
  const [formData, setFormData] = useState<MovieFormData>({
    imdb_id: '',
    title: '',
    year: null,
    genre: '',
    director: '',
    plot: '',
    poster: '',
    imdb_rating: null,
    runtime: '',
    rated: '',
    released: '',
    language: '',
    country: '',
    actors: '',
    writer: '',
    awards: '',
    box_office: '',
    production: '',
    website: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Redirect if not admin
  React.useEffect(() => {
    if (user && !user.is_admin) {
      navigate('/');
      toast({
        title: 'Access Denied',
        description: 'You do not have admin privileges.',
        variant: 'destructive',
      });
    }
  }, [user, navigate, toast]);

  const handleInputChange = (field: keyof MovieFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    // Validate required fields
    if (!formData.title.trim() || !formData.imdb_id.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title and IMDb ID are required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Clean form data - remove empty strings and convert to proper types
      const cleanedData = {
        imdb_id: formData.imdb_id.trim(),
        title: formData.title.trim(),
        year: formData.year && formData.year > 0 ? formData.year : null,
        genre: formData.genre.trim() || null,
        director: formData.director.trim() || null,
        plot: formData.plot.trim() || null,
        poster: formData.poster.trim() || null,
        imdb_rating: formData.imdb_rating && formData.imdb_rating > 0 ? Number(formData.imdb_rating) : null,
        runtime: formData.runtime.trim() || null,
        rated: formData.rated.trim() || null,
        released: formData.released.trim() || null,
        language: formData.language.trim() || null,
        country: formData.country.trim() || null,
        actors: formData.actors.trim() || null,
        writer: formData.writer.trim() || null,
        awards: formData.awards.trim() || null,
        box_office: formData.box_office.trim() || null,
        production: formData.production.trim() || null,
        website: formData.website.trim() || null,
      };

      await setDoc(doc(db, 'movies', cleanedData.imdb_id), cleanedData, { merge: true });

      toast({
        title: 'Movie Added Successfully!',
        description: `${formData.title} has been added to the database.`,
      });

      // Reset form
      setFormData({
        imdb_id: '',
        title: '',
        year: null,
        genre: '',
        director: '',
        plot: '',
        poster: '',
        imdb_rating: null,
        runtime: '',
        rated: '',
        released: '',
        language: '',
        country: '',
        actors: '',
        writer: '',
        awards: '',
        box_office: '',
        production: '',
        website: '',
      });
    } catch (error) {
      console.error('Add movie error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add movie',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || !user.is_admin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="hover:bg-accent/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Add Movie</h1>
            <p className="text-muted-foreground">
              Add movies directly to the database
            </p>
          </div>
        </div>

        {/* Add Movie Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Movie</CardTitle>
            <CardDescription>
              Fill in the movie details to add it to the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="imdb_id">IMDb ID *</Label>
                  <Input
                    id="imdb_id"
                    placeholder="tt1234567"
                    value={formData.imdb_id}
                    onChange={(e) => handleInputChange('imdb_id', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Movie Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter movie title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="2024"
                    value={formData.year || ''}
                    onChange={(e) => handleInputChange('year', parseInt(e.target.value) || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rated">Rated</Label>
                  <Input
                    id="rated"
                    placeholder="PG-13"
                    value={formData.rated}
                    onChange={(e) => handleInputChange('rated', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="runtime">Runtime</Label>
                  <Input
                    id="runtime"
                    placeholder="120 min"
                    value={formData.runtime}
                    onChange={(e) => handleInputChange('runtime', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Input
                  id="genre"
                  placeholder="Action, Adventure, Drama"
                  value={formData.genre}
                  onChange={(e) => handleInputChange('genre', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="director">Director</Label>
                <Input
                  id="director"
                  placeholder="Director name"
                  value={formData.director}
                  onChange={(e) => handleInputChange('director', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actors">Actors</Label>
                <Input
                  id="actors"
                  placeholder="Actor 1, Actor 2, Actor 3"
                  value={formData.actors}
                  onChange={(e) => handleInputChange('actors', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plot">Plot</Label>
                <Textarea
                  id="plot"
                  placeholder="Movie plot summary..."
                  value={formData.plot}
                  onChange={(e) => handleInputChange('plot', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    placeholder="English"
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="USA"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="imdb_rating">IMDb Rating</Label>
                  <Input
                    id="imdb_rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="8.5"
                    value={formData.imdb_rating || ''}
                    onChange={(e) => handleInputChange('imdb_rating', parseFloat(e.target.value) || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="released">Release Date</Label>
                  <Input
                    id="released"
                    placeholder="15 Dec 2023"
                    value={formData.released}
                    onChange={(e) => handleInputChange('released', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="poster">Poster URL</Label>
                <Input
                  id="poster"
                  placeholder="https://example.com/poster.jpg"
                  value={formData.poster}
                  onChange={(e) => handleInputChange('poster', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="awards">Awards</Label>
                <Input
                  id="awards"
                  placeholder="Won 2 Oscars. Another 10 wins & 20 nominations."
                  value={formData.awards}
                  onChange={(e) => handleInputChange('awards', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="box_office">Box Office</Label>
                <Input
                  id="box_office"
                  placeholder="$1,000,000,000"
                  value={formData.box_office}
                  onChange={(e) => handleInputChange('box_office', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="production">Production</Label>
                <Input
                  id="production"
                  placeholder="Production Company"
                  value={formData.production}
                  onChange={(e) => handleInputChange('production', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isSubmitting ? 'Adding...' : 'Add Movie'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
