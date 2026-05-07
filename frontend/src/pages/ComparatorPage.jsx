import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { GitCompare, Upload, X, User, Loader2, CheckCircle, AlertTriangle, Image, Printer, Download } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

var API = process.env.REACT_APP_BACKEND_URL + '/api';

function getHeaders() {
  return { headers: { Authorization: 'Bearer ' + localStorage.getItem('admin_token') } };
}

export default function ComparatorPage() {
  var _m = useState('profiles');
  var mode = _m[0]; var setMode = _m[1];
  var _p = useState([]);
  var profiles = _p[0]; var setProfiles = _p[1];
  var _s1 = useState(null);
  var sel1 = _s1[0]; var setSel1 = _s1[1];
  var _s2 = useState(null);
  var sel2 = _s2[0]; var setSel2 = _s2[1];
  var _ph1 = useState(null);
  var directPhoto1 = _ph1[0]; var setDirectPhoto1 = _ph1[1];
  var _ph2 = useState(null);
  var directPhoto2 = _ph2[0]; var setDirectPhoto2 = _ph2[1];
  var _c = useState(false);
  var comparing = _c[0]; var setComparing = _c[1];
  var _r = useState(null);
  var result = _r[0]; var setResult = _r[1];
  var _pi1 = useState(0);
  var photoIdx1 = _pi1[0]; var setPhotoIdx1 = _pi1[1];
  var _pi2 = useState(0);
  var photoIdx2 = _pi2[0]; var setPhotoIdx2 = _pi2[1];
  var fileRef1 = useRef(null);
  var fileRef2 = useRef(null);

  useEffect(function() {
    axios.get(API + '/seeker/profiles', getHeaders())
      .then(function(r) { setProfiles(r.data); })
      .catch(function() {});
  }, []);

  function handleFileUpload(setter) {
    return function(e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function() { setter(reader.result); };
      reader.readAsDataURL(file);
    };
  }

  function getPhoto1() {
    if (mode === 'direct') return directPhoto1;
    if (sel1 && sel1.photos && sel1.photos.length > 0) return sel1.photos[photoIdx1] || sel1.photos[0];
    return null;
  }

  function getPhoto2() {
    if (mode === 'direct') return directPhoto2;
    if (sel2 && sel2.photos && sel2.photos.length > 0) return sel2.photos[photoIdx2] || sel2.photos[0];
    return null;
  }

  function doCompare() {
    var p1 = getPhoto1();
    var p2 = getPhoto2();
    if (!p1 || !p2) { toast.error('Please select photos for both sides'); return; }
    setComparing(true);
    setResult(null);
    axios.post(API + '/seeker/compare-photos', {
      photo1: p1,
      photo2: p2,
      profile1_id: sel1 ? sel1.id : null,
      profile2_id: sel2 ? sel2.id : null
    }, getHeaders())
      .then(function(r) { setResult(r.data.analysis); toast.success('Comparison complete'); })
      .catch(function(e) { toast.error(e.response && e.response.data && e.response.data.detail || 'Comparison failed'); })
      .finally(function() { setComparing(false); });
  }

  function scoreColor(score) {
    if (score >= 75) return '#ef4444';
    if (score >= 50) return '#f59e0b';
    if (score >= 25) return '#22c55e';
    return '#22c55e';
  }

  function renderProfileSelector(selected, setSelected, photoIdx, setPhotoIdx, side) {
    return React.createElement('div', { className: 'space-y-3' },
      React.createElement('label', { className: 'text-zinc-400 text-sm font-medium' }, 'Profile ' + side),
      !selected
        ? React.createElement('div', { className: 'space-y-2 max-h-60 overflow-y-auto' },
            profiles.map(function(p) {
              var pc = (p.photos || []).length;
              return React.createElement('div', {
                key: p.id,
                className: 'flex items-center gap-3 p-3 rounded-lg border border-zinc-800 hover:border-purple-600 cursor-pointer transition-colors bg-zinc-900/30',
                onClick: function() { setSelected(p); }
              },
                React.createElement('div', { className: 'w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center overflow-hidden flex-shrink-0' },
                  pc > 0
                    ? React.createElement('img', { src: p.photos[0], alt: '', className: 'w-full h-full object-cover' })
                    : React.createElement(User, { className: 'w-5 h-5 text-purple-400' })
                ),
                React.createElement('div', { className: 'min-w-0' },
                  React.createElement('p', { className: 'text-white text-sm font-medium truncate' }, p.first_name + ' ' + (p.last_name || '')),
                  React.createElement('p', { className: 'text-zinc-500 text-xs' }, pc + ' photo' + (pc !== 1 ? 's' : ''))
                )
              );
            })
          )
        : React.createElement('div', { className: 'space-y-3' },
            React.createElement('div', { className: 'flex items-center justify-between' },
              React.createElement('span', { className: 'text-white font-medium' }, selected.first_name + ' ' + (selected.last_name || '')),
              React.createElement(Button, { size: 'sm', variant: 'ghost', className: 'text-zinc-400', onClick: function() { setSelected(null); } },
                React.createElement(X, { className: 'w-4 h-4' })
              )
            ),
            (selected.photos && selected.photos.length > 0)
              ? React.createElement('div', null,
                  React.createElement('div', { className: 'aspect-square rounded-lg overflow-hidden bg-zinc-800 mb-2' },
                    React.createElement('img', { src: selected.photos[photoIdx] || selected.photos[0], alt: '', className: 'w-full h-full object-cover' })
                  ),
                  selected.photos.length > 1
                    ? React.createElement('div', { className: 'flex gap-1 flex-wrap' },
                        selected.photos.map(function(ph, i) {
                          return React.createElement('div', {
                            key: i,
                            className: 'w-10 h-10 rounded cursor-pointer border-2 overflow-hidden ' + (i === photoIdx ? 'border-purple-500' : 'border-zinc-700'),
                            onClick: function() { setPhotoIdx(i); }
                          },
                            React.createElement('img', { src: ph, alt: '', className: 'w-full h-full object-cover' })
                          );
                        })
                      )
                    : null
                )
              : React.createElement('div', { className: 'aspect-square rounded-lg bg-zinc-800 flex items-center justify-center' },
                  React.createElement('p', { className: 'text-zinc-500 text-sm' }, 'No photos')
                )
          )
    );
  }

  function renderDirectUpload(photo, setPhoto, fileRef, side) {
    return React.createElement('div', { className: 'space-y-3' },
      React.createElement('label', { className: 'text-zinc-400 text-sm font-medium' }, 'Photo ' + side),
      photo
        ? React.createElement('div', { className: 'relative' },
            React.createElement('div', { className: 'aspect-square rounded-lg overflow-hidden bg-zinc-800' },
              React.createElement('img', { src: photo, alt: '', className: 'w-full h-full object-cover' })
            ),
            React.createElement('button', {
              onClick: function() { setPhoto(null); },
              className: 'absolute top-2 right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center'
            }, React.createElement(X, { className: 'w-3 h-3' }))
          )
        : React.createElement('div', {
            className: 'aspect-square rounded-lg border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center cursor-pointer hover:border-purple-600 transition-colors bg-zinc-900/30',
            onClick: function() { fileRef.current && fileRef.current.click(); }
          },
            React.createElement(Upload, { className: 'w-8 h-8 text-zinc-500 mb-2' }),
            React.createElement('p', { className: 'text-zinc-500 text-sm' }, 'Upload photo')
          ),
      React.createElement('input', { ref: fileRef, type: 'file', accept: 'image/*', hidden: true, onChange: handleFileUpload(setPhoto) })
    );
  }

  function renderInfoComparison() {
    if (mode !== 'profiles' || !sel1 || !sel2) return null;
    var fields = [
      ['First Name', 'first_name'], ['Last Name', 'last_name'], ['Address', 'address'],
      ['Birth Date', 'birth_date'], ['Birth Place', 'birth_place'], ['Notes', 'notes']
    ];
    return React.createElement(Card, { className: 'bg-zinc-900/50 border-zinc-800 mt-6' },
      React.createElement(CardHeader, null,
        React.createElement(CardTitle, { className: 'text-white text-base' }, 'Information Comparison')
      ),
      React.createElement(CardContent, null,
        React.createElement('div', { className: 'overflow-x-auto' },
          React.createElement('table', { className: 'w-full text-sm' },
            React.createElement('thead', null,
              React.createElement('tr', { className: 'border-b border-zinc-800' },
                React.createElement('th', { className: 'text-left text-zinc-400 py-2 pr-4 w-1/4' }, 'Field'),
                React.createElement('th', { className: 'text-left text-zinc-400 py-2 pr-4 w-5/12' }, sel1.first_name + ' ' + (sel1.last_name || '')),
                React.createElement('th', { className: 'text-left text-zinc-400 py-2 w-5/12' }, sel2.first_name + ' ' + (sel2.last_name || ''))
              )
            ),
            React.createElement('tbody', null,
              fields.map(function(f) {
                var v1 = sel1[f[1]] || '-';
                var v2 = sel2[f[1]] || '-';
                var match = v1 === v2 && v1 !== '-';
                return React.createElement('tr', { key: f[1], className: 'border-b border-zinc-800/50' },
                  React.createElement('td', { className: 'py-2 pr-4 text-zinc-400 font-medium' }, f[0]),
                  React.createElement('td', { className: 'py-2 pr-4 text-white' }, v1),
                  React.createElement('td', { className: 'py-2 text-white flex items-center gap-2' },
                    v2,
                    match ? React.createElement(Badge, { className: 'bg-amber-500/20 text-amber-400 text-xs ml-2' }, 'Match') : null
                  )
                );
              })
            )
          )
        )
      )
    );
  }

  function printComparison() {
    if (!result) return;
    var p1Name = sel1 ? (sel1.first_name + ' ' + (sel1.last_name || '')) : 'Photo A';
    var p2Name = sel2 ? (sel2.first_name + ' ' + (sel2.last_name || '')) : 'Photo B';
    var score = result.similarity_score || 0;
    var sColor = score >= 75 ? '#ef4444' : score >= 50 ? '#f59e0b' : '#22c55e';
    var html = '<!DOCTYPE html><html><head><title>Comparison Report</title><style>' +
      'body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto;color:#333;font-size:12px;}' +
      'h1{font-size:20px;border-bottom:2px solid #7c3aed;padding-bottom:8px;}' +
      'h2{font-size:14px;color:#7c3aed;margin-top:16px;}' +
      '.score{font-size:36px;font-weight:bold;}' +
      '.red{color:#ef4444;}.green{color:#22c55e;}.amber{color:#f59e0b;}' +
      '.footer{margin-top:30px;border-top:1px solid #e5e7eb;padding-top:10px;text-align:center;color:#999;font-size:10px;}' +
      '</style></head><body>' +
      '<h1>Photo Comparison Report</h1>' +
      '<p><strong>' + p1Name + '</strong> vs <strong>' + p2Name + '</strong> | Date: ' + new Date().toLocaleDateString() + '</p>' +
      '<p><span class="score" style="color:' + sColor + '">' + score + '%</span> Similarity Score</p>' +
      '<p style="color:' + (result.same_person ? '#ef4444' : '#22c55e') + ';font-weight:bold;font-size:14px;">' + (result.same_person ? 'LIKELY SAME PERSON' : 'LIKELY DIFFERENT PEOPLE') + '</p>' +
      '<p>Confidence: ' + (result.confidence || 'N/A') + '</p>' +
      (result.facial_analysis ? '<h2>Facial Analysis</h2><p>' + result.facial_analysis + '</p>' : '') +
      (result.verdict ? '<h2>Verdict</h2><p><strong>' + result.verdict + '</strong></p>' : '') +
      (result.inconsistencies && result.inconsistencies.length ? '<h2 class="amber">Inconsistencies</h2><ul>' + result.inconsistencies.map(function(i) { return '<li>' + i + '</li>'; }).join('') + '</ul>' : '') +
      (result.manipulation_signs && result.manipulation_signs.length ? '<h2 class="red">Manipulation Signs</h2><ul>' + result.manipulation_signs.map(function(s) { return '<li class="red">' + s + '</li>'; }).join('') + '</ul>' : '') +
      '<div class="footer">Generated by 2good2breal Comparator | ' + new Date().toLocaleString() + '</div></body></html>';
    var iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    iframe.srcdoc = html;
    iframe.onload = function() { iframe.contentWindow.print(); setTimeout(function() { document.body.removeChild(iframe); }, 1000); };
  }

  function downloadComparisonPDF() {
    if (!sel1 && !sel2) { toast.error('Select profiles first'); return; }
    axios.post(API + '/seeker/comparator-pdf', {
      photo1: getPhoto1() || '',
      photo2: getPhoto2() || '',
      profile1_id: sel1 ? sel1.id : null,
      profile2_id: sel2 ? sel2.id : null
    }, Object.assign({}, getHeaders(), { responseType: 'blob' }))
      .then(function(res) {
        var url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
        var a = document.createElement('a'); a.href = url;
        a.download = 'comparison_report.pdf';
        a.click(); window.URL.revokeObjectURL(url);
        toast.success('PDF downloaded');
      })
      .catch(function() { toast.error('PDF download failed. Run a comparison first.'); });
  }

  function renderResult() {
    if (!result) return null;
    var score = result.similarity_score || 0;
    var same = result.same_person;
    var color = scoreColor(score);
    return React.createElement(Card, { className: 'bg-zinc-900/50 border-zinc-800 mt-6' },
      React.createElement(CardContent, { className: 'p-6' },
        React.createElement('div', { className: 'flex justify-end gap-2 mb-4' },
          React.createElement(Button, { size: 'sm', variant: 'outline', onClick: printComparison, className: 'border-zinc-700 text-zinc-300' },
            React.createElement(Printer, { className: 'w-4 h-4 mr-1' }), ' Print'),
          React.createElement(Button, { size: 'sm', variant: 'outline', onClick: downloadComparisonPDF, className: 'border-zinc-700 text-zinc-300' },
            React.createElement(Download, { className: 'w-4 h-4 mr-1' }), ' PDF')
        ),
        React.createElement('div', { className: 'text-center mb-6' },
          React.createElement('div', { className: 'text-5xl font-bold mb-2', style: { color: color } }, score + '%'),
          React.createElement('p', { className: 'text-zinc-400 text-sm' }, 'Similarity Score'),
          React.createElement('div', { className: 'mt-3' },
            same
              ? React.createElement(Badge, { className: 'bg-red-500/20 text-red-400 text-sm px-4 py-1' },
                  React.createElement(AlertTriangle, { className: 'w-4 h-4 mr-1' }), ' Likely Same Person')
              : React.createElement(Badge, { className: 'bg-emerald-500/20 text-emerald-400 text-sm px-4 py-1' },
                  React.createElement(CheckCircle, { className: 'w-4 h-4 mr-1' }), ' Likely Different People')
          ),
          React.createElement(Badge, { variant: 'outline', className: 'ml-2 border-zinc-700 text-zinc-400 text-xs' },
            'Confidence: ' + (result.confidence || 'N/A'))
        ),
        React.createElement('div', { className: 'space-y-4 text-sm' },
          result.facial_analysis ? React.createElement('div', null,
            React.createElement('p', { className: 'text-zinc-400 font-medium mb-1' }, 'Facial Analysis'),
            React.createElement('p', { className: 'text-white bg-zinc-800/50 rounded-lg p-3' }, result.facial_analysis)
          ) : null,
          result.verdict ? React.createElement('div', null,
            React.createElement('p', { className: 'text-zinc-400 font-medium mb-1' }, 'Verdict'),
            React.createElement('p', { className: 'text-white font-semibold bg-zinc-800/50 rounded-lg p-3' }, result.verdict)
          ) : null,
          result.inconsistencies && result.inconsistencies.length > 0 ? React.createElement('div', null,
            React.createElement('p', { className: 'text-zinc-400 font-medium mb-1' }, 'Inconsistencies'),
            React.createElement('ul', { className: 'list-disc ml-4 text-amber-400' },
              result.inconsistencies.map(function(inc, i) {
                return React.createElement('li', { key: i }, inc);
              })
            )
          ) : null,
          result.manipulation_signs && result.manipulation_signs.length > 0 ? React.createElement('div', null,
            React.createElement('p', { className: 'text-zinc-400 font-medium mb-1' }, 'Manipulation Signs'),
            React.createElement('ul', { className: 'list-disc ml-4 text-red-400' },
              result.manipulation_signs.map(function(s, i) {
                return React.createElement('li', { key: i }, s);
              })
            )
          ) : null
        )
      )
    );
  }

  var canCompare = mode === 'direct' ? (directPhoto1 && directPhoto2) : (getPhoto1() && getPhoto2());

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('div', { className: 'flex items-center justify-between' },
      React.createElement('h2', { className: 'text-xl font-bold text-white flex items-center gap-2' },
        React.createElement(GitCompare, { className: 'w-5 h-5 text-purple-400' }), ' Comparator'
      )
    ),
    React.createElement('div', { className: 'flex gap-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-1' },
      React.createElement('button', {
        onClick: function() { setMode('profiles'); setResult(null); },
        className: 'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + (mode === 'profiles' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800')
      }, 'Compare Profiles'),
      React.createElement('button', {
        onClick: function() { setMode('direct'); setResult(null); },
        className: 'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + (mode === 'direct' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800')
      }, 'Direct Photo Compare')
    ),
    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
      React.createElement(Card, { className: 'bg-zinc-900/50 border-zinc-800' },
        React.createElement(CardContent, { className: 'p-4' },
          mode === 'profiles'
            ? renderProfileSelector(sel1, setSel1, photoIdx1, setPhotoIdx1, 'A')
            : renderDirectUpload(directPhoto1, setDirectPhoto1, fileRef1, 'A')
        )
      ),
      React.createElement(Card, { className: 'bg-zinc-900/50 border-zinc-800' },
        React.createElement(CardContent, { className: 'p-4' },
          mode === 'profiles'
            ? renderProfileSelector(sel2, setSel2, photoIdx2, setPhotoIdx2, 'B')
            : renderDirectUpload(directPhoto2, setDirectPhoto2, fileRef2, 'B')
        )
      )
    ),
    React.createElement('div', { className: 'text-center' },
      React.createElement(Button, {
        onClick: doCompare,
        disabled: !canCompare || comparing,
        className: 'bg-purple-600 hover:bg-purple-500 px-8',
        'data-testid': 'compare-btn'
      },
        comparing
          ? React.createElement(React.Fragment, null, React.createElement(Loader2, { className: 'w-4 h-4 mr-2 animate-spin' }), ' Analyzing...')
          : React.createElement(React.Fragment, null, React.createElement(GitCompare, { className: 'w-4 h-4 mr-2' }), ' Compare Photos')
      )
    ),
    renderResult(),
    renderInfoComparison()
  );
}
