import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Search, Plus, Trash2, Upload, X, User, MapPin, Calendar, FileText, ChevronLeft, Image, Edit2, Save, Printer, Download } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function getHeaders() {
  return { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } };
}

export default function ProfileSeekerPage() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(function() {
    if (!localStorage.getItem('admin_token')) { navigate('/login'); return; }
    loadData();
  }, [navigate]);

  function loadData() {
    axios.get(API + '/seeker/profiles', getHeaders())
      .then(function(r) { setProfiles(r.data); setLoading(false); })
      .catch(function(e) { if (e.response && e.response.status === 401) navigate('/login'); setLoading(false); });
  }

  function doDelete(id) {
    if (!window.confirm('Delete this profile?')) return;
    axios.delete(API + '/seeker/profiles/' + id, getHeaders())
      .then(function() {
        setProfiles(function(p) { return p.filter(function(x) { return x.id !== id; }); });
        if (selected && selected.id === id) { setView('list'); setSelected(null); }
        toast.success('Deleted');
      })
      .catch(function() { toast.error('Delete failed'); });
  }

  const filtered = profiles.filter(function(p) {
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.first_name || '').toLowerCase().indexOf(q) >= 0 ||
      (p.last_name || '').toLowerCase().indexOf(q) >= 0 ||
      (p.address || '').toLowerCase().indexOf(q) >= 0;
  });

  if (loading) return React.createElement('div', { className: 'flex items-center justify-center py-20 text-purple-400' }, 'Loading...');

  if (view === 'new') return React.createElement(NewForm, {
    onDone: function(p) { setProfiles(function(prev) { return [p].concat(prev); }); setSelected(p); setView('detail'); },
    onCancel: function() { setView('list'); }
  });

  if (view === 'detail' && selected) return React.createElement(Detail, {
    profile: selected,
    onBack: function() { setView('list'); setSelected(null); },
    onUpdate: function(u) { setSelected(u); setProfiles(function(prev) { return prev.map(function(p) { return p.id === u.id ? u : p; }); }); }
  });

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('div', { className: 'flex items-center justify-between' },
      React.createElement('h2', { className: 'text-xl font-bold text-white' }, 'Profile Seeker'),
      React.createElement(Button, { onClick: function() { setView('new'); }, className: 'bg-purple-600 hover:bg-purple-500', 'data-testid': 'new-seeker-profile' },
        React.createElement(Plus, { className: 'w-4 h-4 mr-2' }), ' New Profile'
      )
    ),
    React.createElement('div', { className: 'relative' },
      React.createElement(Search, { className: 'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500' }),
      React.createElement(Input, { value: search, onChange: function(e) { setSearch(e.target.value); }, placeholder: 'Search profiles...', className: 'pl-10 bg-zinc-900/50 border-zinc-800 text-white' })
    ),
    filtered.length === 0
      ? React.createElement('div', { className: 'text-center py-16 text-zinc-500' },
          React.createElement(Search, { className: 'w-10 h-10 mx-auto mb-3 opacity-50' }),
          React.createElement('p', null, search ? 'No match' : 'No profiles yet'),
          React.createElement(Button, { onClick: function() { setView('new'); }, variant: 'outline', className: 'mt-4 border-zinc-700 text-zinc-300' },
            React.createElement(Plus, { className: 'w-4 h-4 mr-2' }), ' Create First Profile'
          )
        )
      : React.createElement('div', { className: 'space-y-3' },
          filtered.map(function(p) {
            const pc = (p.photos || []).length;
            return React.createElement('div', { key: p.id, className: 'border border-zinc-800 rounded-xl p-4 hover:border-purple-700/50 transition-colors cursor-pointer bg-zinc-900/50', onClick: function() { setSelected(p); setView('detail'); } },
              React.createElement('div', { className: 'flex items-center gap-4' },
                React.createElement('div', { className: 'w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden' },
                  pc > 0
                    ? React.createElement('img', { src: p.photos[0], alt: '', className: 'w-full h-full object-cover' })
                    : React.createElement(User, { className: 'w-6 h-6 text-purple-400' })
                ),
                React.createElement('div', { className: 'flex-1 min-w-0' },
                  React.createElement('h3', { className: 'text-white font-semibold truncate' }, p.first_name + ' ' + (p.last_name || '')),
                  React.createElement('div', { className: 'flex items-center gap-3 text-zinc-400 text-sm mt-1' },
                    p.address ? React.createElement('span', { className: 'flex items-center gap-1' }, React.createElement(MapPin, { className: 'w-3 h-3' }), p.address) : null,
                    React.createElement('span', { className: 'flex items-center gap-1' }, React.createElement(Image, { className: 'w-3 h-3' }), pc + ' photo' + (pc !== 1 ? 's' : ''))
                  )
                ),
                React.createElement(Button, { variant: 'ghost', size: 'sm', className: 'text-red-400 hover:text-red-300 hover:bg-red-950/50 flex-shrink-0', onClick: function(e) { e.stopPropagation(); doDelete(p.id); } },
                  React.createElement(Trash2, { className: 'w-4 h-4' })
                )
              )
            );
          })
        )
  );
}

function NewForm(props) {
  const formRef = useRef({ first_name: '', last_name: '', address: '', birth_date: '', birth_place: '', notes: '' });
  const photosRef = useRef([]);
  const fileRef = useRef(null);
  const _f = useState(0); const tick = _f[1];
  const _s = useState(false); const saving = _s[0]; const setSaving = _s[1];

  function set(k, v) { formRef.current[k] = v; tick(function(n) { return n + 1; }); }
  function addPhotos(e) {
    const files = Array.from(e.target.files || []);
    files.forEach(function(file) {
      const r = new FileReader();
      r.onload = function() { photosRef.current.push({ file: file, preview: r.result }); tick(function(n) { return n + 1; }); };
      r.readAsDataURL(file);
    });
  }
  function removePhoto(i) { photosRef.current.splice(i, 1); tick(function(n) { return n + 1; }); }

  function submit(e) {
    e.preventDefault();
    if (!formRef.current.first_name.trim()) { toast.error('First name required'); return; }
    setSaving(true);
    axios.post(API + '/seeker/profiles', formRef.current, getHeaders())
      .then(function(res) {
        const pid = res.data.id;
        const uploads = photosRef.current.map(function(p) {
          const fd = new FormData(); fd.append('photo', p.file);
          return axios.post(API + '/seeker/profiles/' + pid + '/photos', fd, getHeaders());
        });
        return Promise.all(uploads).then(function() { return axios.get(API + '/seeker/profiles/' + pid, getHeaders()); });
      })
      .then(function(res) { props.onDone(res.data); toast.success('Created'); })
      .catch(function(err) { toast.error(err.response && err.response.data && err.response.data.detail || 'Failed'); })
      .finally(function() { setSaving(false); });
  }

  const f = formRef.current;
  const photos = photosRef.current;

  return React.createElement('form', { onSubmit: submit, className: 'space-y-6' },
    React.createElement('div', { className: 'flex items-center gap-4' },
      React.createElement(Button, { type: 'button', variant: 'outline', size: 'sm', onClick: props.onCancel, className: 'border-zinc-700 text-zinc-300' },
        React.createElement(ChevronLeft, { className: 'w-4 h-4 mr-1' }), ' Cancel'),
      React.createElement('h2', { className: 'text-xl font-bold text-white' }, 'New Profile')
    ),
    React.createElement(Card, { className: 'bg-zinc-900/50 border-zinc-800' },
      React.createElement(CardContent, { className: 'p-6 space-y-4' },
        React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
          React.createElement('div', { className: 'space-y-2' }, React.createElement(Label, { className: 'text-zinc-300' }, 'First Name *'), React.createElement(Input, { value: f.first_name, onChange: function(e) { set('first_name', e.target.value); }, className: 'bg-zinc-800/50 border-zinc-700 text-white', required: true })),
          React.createElement('div', { className: 'space-y-2' }, React.createElement(Label, { className: 'text-zinc-300' }, 'Last Name'), React.createElement(Input, { value: f.last_name, onChange: function(e) { set('last_name', e.target.value); }, className: 'bg-zinc-800/50 border-zinc-700 text-white' }))
        ),
        React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
          React.createElement('div', { className: 'space-y-2' }, React.createElement(Label, { className: 'text-zinc-300' }, 'Address'), React.createElement(Input, { value: f.address, onChange: function(e) { set('address', e.target.value); }, className: 'bg-zinc-800/50 border-zinc-700 text-white' })),
          React.createElement('div', { className: 'space-y-2' }, React.createElement(Label, { className: 'text-zinc-300' }, 'Birth Date'), React.createElement(Input, { value: f.birth_date, onChange: function(e) { set('birth_date', e.target.value); }, placeholder: 'DD/MM/YYYY', className: 'bg-zinc-800/50 border-zinc-700 text-white' }))
        ),
        React.createElement('div', { className: 'space-y-2' }, React.createElement(Label, { className: 'text-zinc-300' }, 'Birth Place'), React.createElement(Input, { value: f.birth_place, onChange: function(e) { set('birth_place', e.target.value); }, className: 'bg-zinc-800/50 border-zinc-700 text-white' })),
        React.createElement('div', { className: 'space-y-2' }, React.createElement(Label, { className: 'text-zinc-300' }, 'Notes'), React.createElement(Textarea, { value: f.notes, onChange: function(e) { set('notes', e.target.value); }, className: 'bg-zinc-800/50 border-zinc-700 text-white', rows: 3 })),
        React.createElement('div', { className: 'space-y-2' },
          React.createElement(Label, { className: 'text-zinc-300' }, 'Photos'),
          React.createElement('div', { className: 'border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center cursor-pointer hover:border-purple-600 transition-colors', onClick: function() { fileRef.current && fileRef.current.click(); } },
            React.createElement(Upload, { className: 'w-8 h-8 mx-auto text-zinc-500 mb-2' }),
            React.createElement('p', { className: 'text-zinc-400 text-sm' }, 'Click to add photos')
          ),
          React.createElement('input', { ref: fileRef, type: 'file', accept: 'image/*', multiple: true, hidden: true, onChange: addPhotos }),
          photos.length > 0 ? React.createElement('div', { className: 'grid grid-cols-4 gap-2 mt-2' },
            photos.map(function(p, i) {
              return React.createElement('div', { key: i, className: 'relative group rounded-lg overflow-hidden aspect-square bg-zinc-800' },
                React.createElement('img', { src: p.preview, alt: '', className: 'w-full h-full object-cover' }),
                React.createElement('button', { type: 'button', onClick: function() { removePhoto(i); }, className: 'absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity' },
                  React.createElement(X, { className: 'w-3 h-3' })
                )
              );
            })
          ) : null
        ),
        React.createElement(Button, { type: 'submit', disabled: saving, className: 'w-full bg-purple-600 hover:bg-purple-500' }, saving ? 'Creating...' : 'Create Profile')
      )
    )
  );
}

function Detail(props) {
  const _e = useState(false); const editing = _e[0]; const setEditing = _e[1];
  const _f = useState(props.profile); const form = _f[0]; const setForm = _f[1];
  const _u = useState(false); const uploading = _u[0]; const setUploading = _u[1];
  const _sr = useState(false); const searching = _sr[0]; const setSearching = _sr[1];
  const _res = useState(null); const searchResult = _res[0]; const setSearchResult = _res[1];
  const _poll = useRef(null);
  const fileRef = useRef(null);

  useEffect(function() { setForm(props.profile); setEditing(false); setSearchResult(null); return function() { if (_poll.current) clearInterval(_poll.current); }; }, [props.profile]);

  function startSearch() {
    setSearching(true);
    setSearchResult(null);
    axios.post(API + '/seeker/profiles/' + props.profile.id + '/search', {
      profile_id: props.profile.id,
      search_types: ['web', 'image']
    }, getHeaders())
      .then(function(r) {
        const searchId = r.data.search_id;
        // Poll for results
        _poll.current = setInterval(function() {
          axios.get(API + '/seeker/profiles/' + props.profile.id + '/search/' + searchId, getHeaders())
            .then(function(sr) {
              if (sr.data.status === 'completed') {
                clearInterval(_poll.current);
                setSearchResult(sr.data);
                setSearching(false);
                // Refresh profile to get updated search_results
                axios.get(API + '/seeker/profiles/' + props.profile.id, getHeaders())
                  .then(function(pr) { props.onUpdate(pr.data); });
                toast.success('Search completed');
              }
            })
            .catch(function() {});
        }, 3000);
      })
      .catch(function(e) { toast.error(e.response && e.response.data && e.response.data.detail || 'Search failed'); setSearching(false); });
  }

  function save() {
    axios.put(API + '/seeker/profiles/' + props.profile.id, {
      first_name: form.first_name, last_name: form.last_name, address: form.address,
      birth_date: form.birth_date, birth_place: form.birth_place, notes: form.notes, pseudonyms: form.pseudonyms
    }, getHeaders())
      .then(function(r) { props.onUpdate(r.data); setEditing(false); toast.success('Saved'); })
      .catch(function() { toast.error('Save failed'); });
  }

  function uploadPhoto(e) {
    const files = e.target.files;
    if (!files || !files.length) return;
    setUploading(true);
    const uploads = Array.from(files).map(function(file) {
      const fd = new FormData(); fd.append('photo', file);
      return axios.post(API + '/seeker/profiles/' + props.profile.id + '/photos', fd, getHeaders());
    });
    Promise.all(uploads)
      .then(function() { return axios.get(API + '/seeker/profiles/' + props.profile.id, getHeaders()); })
      .then(function(r) { props.onUpdate(r.data); toast.success('Photos uploaded'); })
      .catch(function() { toast.error('Upload failed'); })
      .finally(function() { setUploading(false); });
  }

  function deletePhoto(idx) {
    axios.delete(API + '/seeker/profiles/' + props.profile.id + '/photos/' + idx, getHeaders())
      .then(function() { return axios.get(API + '/seeker/profiles/' + props.profile.id, getHeaders()); })
      .then(function(r) { props.onUpdate(r.data); toast.success('Photo deleted'); })
      .catch(function() { toast.error('Delete failed'); });
  }

  function printResults() {
    const name = (form.first_name || '') + ' ' + (form.last_name || '');
    const sr = latestSearch;
    if (!sr || !sr.results) { toast.error('No results to print'); return; }
    const r = sr.results;
    const a = r.ai_analysis || {};
    const html = '<!DOCTYPE html><html><head><title>Investigation Report - ' + name + '</title><style>' +
      'body{font-family:Arial,sans-serif;padding:40px;max-width:900px;margin:0 auto;color:#333;font-size:12px;}' +
      'h1{font-size:20px;border-bottom:2px solid #7c3aed;padding-bottom:8px;}' +
      'h2{font-size:14px;color:#7c3aed;margin-top:20px;}' +
      '.score{font-size:36px;font-weight:bold;color:' + (a.risk_level === 'critical' ? '#ef4444' : a.risk_level === 'high' ? '#f97316' : a.risk_level === 'medium' ? '#eab308' : '#22c55e') + ';}' +
      '.badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:bold;margin:0 4px;}' +
      '.risk-critical{background:#fef2f2;color:#ef4444;}.risk-high{background:#fff7ed;color:#f97316;}.risk-medium{background:#fefce8;color:#eab308;}.risk-low{background:#f0fdf4;color:#22c55e;}' +
      '.red{color:#ef4444;}.green{color:#22c55e;}' +
      'table{width:100%;border-collapse:collapse;margin:8px 0;}td,th{border:1px solid #e5e7eb;padding:6px 8px;text-align:left;font-size:11px;}th{background:#f9fafb;}' +
      '.footer{margin-top:30px;border-top:1px solid #e5e7eb;padding-top:10px;text-align:center;color:#999;font-size:10px;}' +
      '@media print{body{padding:20px;}}' +
      '</style></head><body>' +
      '<h1>OSINT Investigation Report</h1>' +
      '<p><strong>Subject:</strong> ' + name + ' | <strong>Location:</strong> ' + (form.address || 'N/A') + ' | <strong>Date:</strong> ' + new Date().toLocaleDateString() + '</p>' +
      '<div style="margin:15px 0;"><span class="score">' + (a.online_presence_score || 0) + '%</span> <span style="color:#666;">Online Presence</span>' +
      ' <span class="badge risk-' + (a.risk_level || 'low') + '">Risk: ' + ((a.risk_level || 'N/A').toUpperCase()) + '</span>' +
      (a.image_reuse_detected ? ' <span class="badge risk-critical">IMAGE REUSE DETECTED</span>' : '') + '</div>' +
      (a.summary ? '<p><strong>Summary:</strong> ' + a.summary + '</p>' : '') +
      (a.social_media_found && a.social_media_found.length ? '<h2>Social Media Found</h2><p>' + a.social_media_found.join(', ') + '</p>' : '') +
      (a.suspicious_findings && a.suspicious_findings.length ? '<h2 class="red">Suspicious Findings</h2><ul>' + a.suspicious_findings.map(function(s) { return '<li class="red">' + s + '</li>'; }).join('') + '</ul>' : '') +
      (a.positive_findings && a.positive_findings.length ? '<h2 class="green">Positive Findings</h2><ul>' + a.positive_findings.map(function(s) { return '<li class="green">' + s + '</li>'; }).join('') + '</ul>' : '') +
      (a.recommendation ? '<h2>Recommendation</h2><p>' + a.recommendation + '</p>' : '') +
      '<h2>Web Search Results (' + (r.web_results || []).length + ')</h2><table><tr><th>Title</th><th>Source</th></tr>' +
      (r.web_results || []).slice(0, 15).map(function(w) { return '<tr><td>' + w.title + '</td><td>' + (w.source || w.link) + '</td></tr>'; }).join('') + '</table>' +
      '<h2>Reverse Image Results</h2>' +
      (r.image_results || []).map(function(ir) { return '<p><strong>Photo ' + (ir.photo_index + 1) + ':</strong> ' + (ir.matches_count || 0) + ' matches</p><table><tr><th>Found on</th><th>Link</th></tr>' + (ir.matches || []).slice(0, 5).map(function(m) { return '<tr><td>' + m.title + '</td><td>' + m.link + '</td></tr>'; }).join('') + '</table>'; }).join('') +
      '<div class="footer"><p>Generated by 2good2breal Profile Seeker | ' + new Date().toLocaleString() + '</p></div>' +
      '</body></html>';
    
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    iframe.srcdoc = html;
    iframe.onload = function() { iframe.contentWindow.print(); setTimeout(function() { document.body.removeChild(iframe); }, 1000); };
  }

  const photos = form.photos || [];
  const latestSearch = searchResult || (form.search_results && form.search_results.length > 0 ? form.search_results[form.search_results.length - 1] : null);
  const ai = latestSearch && latestSearch.results ? latestSearch.results.ai_analysis : null;

  function riskColor(level) {
    if (level === 'critical') return 'bg-red-500/20 text-red-400';
    if (level === 'high') return 'bg-orange-500/20 text-orange-400';
    if (level === 'medium') return 'bg-amber-500/20 text-amber-400';
    return 'bg-emerald-500/20 text-emerald-400';
  }

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('div', { className: 'flex items-center gap-3 flex-wrap' },
      React.createElement(Button, { variant: 'outline', size: 'sm', onClick: props.onBack, className: 'border-zinc-700 text-zinc-300' }, React.createElement(ChevronLeft, { className: 'w-4 h-4 mr-1' }), ' Back'),
      React.createElement('h2', { className: 'text-xl font-bold text-white flex-1' }, form.first_name + ' ' + (form.last_name || '')),
      React.createElement(Button, { size: 'sm', onClick: startSearch, disabled: searching, className: 'bg-purple-600 hover:bg-purple-500', 'data-testid': 'search-profile-btn' },
        searching
          ? React.createElement(React.Fragment, null, React.createElement(Search, { className: 'w-4 h-4 mr-1 animate-spin' }), ' Searching...')
          : React.createElement(React.Fragment, null, React.createElement(Search, { className: 'w-4 h-4 mr-1' }), ' Run Investigation')
      ),
      latestSearch && latestSearch.results ? React.createElement(Button, { size: 'sm', variant: 'outline', onClick: printResults, className: 'border-zinc-700 text-zinc-300' },
        React.createElement(Printer, { className: 'w-4 h-4 mr-1' }), ' Print'
      ) : null,
      latestSearch && latestSearch.results ? React.createElement(Button, { size: 'sm', variant: 'outline', onClick: function() {
        axios.get(API + '/seeker/profiles/' + props.profile.id + '/report-pdf', Object.assign({}, getHeaders(), { responseType: 'blob' }))
          .then(function(res) {
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const a = document.createElement('a'); a.href = url;
            a.download = 'investigation_' + (form.first_name || '') + '_' + (form.last_name || '') + '.pdf';
            a.click(); window.URL.revokeObjectURL(url);
            toast.success('PDF downloaded');
          })
          .catch(function() { toast.error('PDF download failed'); });
      }, className: 'border-zinc-700 text-zinc-300' },
        React.createElement(Download, { className: 'w-4 h-4 mr-1' }), ' PDF'
      ) : null,
      editing
        ? React.createElement(Button, { size: 'sm', onClick: save, className: 'bg-emerald-600 hover:bg-emerald-500' }, React.createElement(Save, { className: 'w-4 h-4 mr-1' }), ' Save')
        : React.createElement(Button, { variant: 'outline', size: 'sm', onClick: function() { setEditing(true); }, className: 'border-zinc-700 text-zinc-300' }, React.createElement(Edit2, { className: 'w-4 h-4 mr-1' }), ' Edit')
    ),
    // Search results banner
    searching ? React.createElement('div', { className: 'bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-center' },
      React.createElement(Search, { className: 'w-5 h-5 text-purple-400 animate-spin mx-auto mb-2' }),
      React.createElement('p', { className: 'text-purple-300 text-sm' }, 'Running web search + reverse image search + AI analysis...'),
      React.createElement('p', { className: 'text-zinc-500 text-xs mt-1' }, 'This may take 15-30 seconds')
    ) : null,
    // AI Analysis summary
    ai && !ai.error ? React.createElement(Card, { className: 'bg-zinc-900/50 border-zinc-800' },
      React.createElement(CardContent, { className: 'p-6' },
        React.createElement('div', { className: 'flex items-center gap-4 mb-4' },
          React.createElement('div', { className: 'text-3xl font-bold text-white' }, (ai.online_presence_score || 0) + '%'),
          React.createElement('div', null,
            React.createElement('p', { className: 'text-zinc-400 text-xs' }, 'Online Presence Score'),
            React.createElement('span', { className: 'inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ' + riskColor(ai.risk_level) }, 'Risk: ' + (ai.risk_level || 'unknown').toUpperCase())
          ),
          ai.image_reuse_detected ? React.createElement('span', { className: 'inline-block px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400' }, 'Image Reuse Detected') : null
        ),
        ai.summary ? React.createElement('p', { className: 'text-white mb-3' }, ai.summary) : null,
        ai.social_media_found && ai.social_media_found.length > 0 ? React.createElement('div', { className: 'mb-3' },
          React.createElement('p', { className: 'text-zinc-400 text-xs font-medium mb-1' }, 'Social Media Found:'),
          React.createElement('div', { className: 'flex gap-1 flex-wrap' },
            ai.social_media_found.map(function(s, i) { return React.createElement('span', { key: i, className: 'px-2 py-0.5 bg-zinc-800 rounded text-xs text-zinc-300' }, s); })
          )
        ) : null,
        ai.suspicious_findings && ai.suspicious_findings.length > 0 ? React.createElement('div', { className: 'mb-3' },
          React.createElement('p', { className: 'text-red-400 text-xs font-medium mb-1' }, 'Suspicious Findings:'),
          ai.suspicious_findings.map(function(s, i) { return React.createElement('p', { key: i, className: 'text-red-300 text-sm ml-2' }, '- ' + s); })
        ) : null,
        ai.positive_findings && ai.positive_findings.length > 0 ? React.createElement('div', { className: 'mb-3' },
          React.createElement('p', { className: 'text-emerald-400 text-xs font-medium mb-1' }, 'Positive Findings:'),
          ai.positive_findings.map(function(s, i) { return React.createElement('p', { key: i, className: 'text-emerald-300 text-sm ml-2' }, '- ' + s); })
        ) : null,
        ai.recommendation ? React.createElement('div', { className: 'bg-zinc-800/50 rounded-lg p-3 mt-3' },
          React.createElement('p', { className: 'text-zinc-400 text-xs font-medium mb-1' }, 'Recommendation:'),
          React.createElement('p', { className: 'text-white text-sm' }, ai.recommendation)
        ) : null
      )
    ) : null,
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
      React.createElement(Card, { className: 'bg-zinc-900/50 border-zinc-800' },
        React.createElement(CardHeader, null, React.createElement(CardTitle, { className: 'text-white text-base' }, 'Information')),
        React.createElement(CardContent, { className: 'space-y-3' },
          ['first_name', 'last_name', 'address', 'birth_date', 'birth_place'].map(function(k) {
            const label = k.replace('_', ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); });
            return React.createElement('div', { key: k, className: 'space-y-1' },
              React.createElement(Label, { className: 'text-zinc-400 text-xs' }, label),
              editing
                ? React.createElement(Input, { value: form[k] || '', onChange: function(e) { setForm(function(f) { const n = Object.assign({}, f); n[k] = e.target.value; return n; }); }, className: 'bg-zinc-800/50 border-zinc-700 text-white' })
                : React.createElement('p', { className: 'text-white' }, form[k] || '-')
            );
          }),
          React.createElement('div', { className: 'space-y-1' },
            React.createElement(Label, { className: 'text-zinc-400 text-xs' }, 'Notes'),
            editing
              ? React.createElement(Textarea, { value: form.notes || '', onChange: function(e) { setForm(function(f) { return Object.assign({}, f, { notes: e.target.value }); }); }, className: 'bg-zinc-800/50 border-zinc-700 text-white', rows: 3 })
              : React.createElement('p', { className: 'text-white whitespace-pre-wrap' }, form.notes || '-')
          )
        )
      ),
      React.createElement(Card, { className: 'bg-zinc-900/50 border-zinc-800' },
        React.createElement(CardHeader, null,
          React.createElement('div', { className: 'flex items-center justify-between' },
            React.createElement(CardTitle, { className: 'text-white text-base' }, 'Photos (' + photos.length + ')'),
            React.createElement(Button, { size: 'sm', variant: 'outline', onClick: function() { fileRef.current && fileRef.current.click(); }, disabled: uploading, className: 'border-zinc-700 text-zinc-300' },
              React.createElement(Upload, { className: 'w-4 h-4 mr-1' }), uploading ? 'Uploading...' : 'Add'),
            React.createElement('input', { ref: fileRef, type: 'file', accept: 'image/*', multiple: true, hidden: true, onChange: uploadPhoto })
          )
        ),
        React.createElement(CardContent, null,
          photos.length === 0
            ? React.createElement('div', { className: 'text-center py-12 text-zinc-500' }, React.createElement(Image, { className: 'w-10 h-10 mx-auto mb-2 opacity-50' }), React.createElement('p', null, 'No photos'))
            : React.createElement('div', { className: 'grid grid-cols-2 sm:grid-cols-3 gap-3' },
                photos.map(function(photo, idx) {
                  return React.createElement('div', { key: idx, className: 'relative group rounded-lg overflow-hidden aspect-square bg-zinc-800' },
                    React.createElement('img', { src: photo, alt: '', className: 'w-full h-full object-cover' }),
                    React.createElement('button', { onClick: function() { deletePhoto(idx); }, className: 'absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity' },
                      React.createElement(X, { className: 'w-3 h-3' })
                    )
                  );
                })
              )
        )
      )
    ),
    // Web & Image search results
    latestSearch && latestSearch.results ? React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
      React.createElement(Card, { className: 'bg-zinc-900/50 border-zinc-800' },
        React.createElement(CardHeader, null, React.createElement(CardTitle, { className: 'text-white text-base' }, 'Web Results (' + (latestSearch.results.web_results || []).length + ')')),
        React.createElement(CardContent, { className: 'space-y-2 max-h-96 overflow-y-auto' },
          (latestSearch.results.web_results || []).map(function(r, i) {
            return React.createElement('a', { key: i, href: r.link, target: '_blank', rel: 'noopener', className: 'block p-2 rounded-lg hover:bg-zinc-800/50 transition-colors' },
              React.createElement('p', { className: 'text-purple-400 text-sm font-medium truncate' }, r.title),
              React.createElement('p', { className: 'text-zinc-500 text-xs truncate' }, r.source || r.link),
              r.snippet ? React.createElement('p', { className: 'text-zinc-400 text-xs mt-0.5 line-clamp-2' }, r.snippet) : null,
              r.is_social ? React.createElement('span', { className: 'inline-block px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded mt-1' }, 'Social Media') : null
            );
          })
        )
      ),
      React.createElement(Card, { className: 'bg-zinc-900/50 border-zinc-800' },
        React.createElement(CardHeader, null, React.createElement(CardTitle, { className: 'text-white text-base' }, 'Reverse Image Results')),
        React.createElement(CardContent, { className: 'space-y-4 max-h-96 overflow-y-auto' },
          (latestSearch.results.image_results || []).map(function(ir, i) {
            return React.createElement('div', { key: i },
              React.createElement('p', { className: 'text-zinc-400 text-xs font-medium mb-1' }, 'Photo ' + (ir.photo_index + 1) + ': ' + (ir.matches_count || 0) + ' matches'),
              (ir.matches || []).slice(0, 5).map(function(m, j) {
                return React.createElement('a', { key: j, href: m.link, target: '_blank', rel: 'noopener', className: 'flex items-center gap-2 p-1.5 rounded hover:bg-zinc-800/50' },
                  m.thumbnail ? React.createElement('img', { src: m.thumbnail, alt: '', className: 'w-8 h-8 rounded object-cover flex-shrink-0' }) : null,
                  React.createElement('div', { className: 'min-w-0' },
                    React.createElement('p', { className: 'text-purple-400 text-xs truncate' }, m.title),
                    React.createElement('p', { className: 'text-zinc-500 text-xs truncate' }, m.link)
                  )
                );
              }),
              ir.error ? React.createElement('p', { className: 'text-red-400 text-xs' }, 'Error: ' + ir.error) : null
            );
          })
        )
      )
    ) : null
  );
}
