import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const UploadProject = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Validate and select ZIP file
  const handleFile = (file: File | undefined) => {
    setError("");

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".zip")) {
      setError("Please select a ZIP file.");
      return;
    }

    setSelectedFile(file);
  };

  // Upload ZIP and start analysis
  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a ZIP file first.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const formData = new FormData();

      // Backend expects the field name "project"
      formData.append("project", selectedFile);

      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Project upload failed.");
      }

      const projectId = result.data.projectId;

      navigate(`/projects/${projectId}`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page">
      <style>{`
        @keyframes uploadFloatA {
          0%, 100% { transform: translate3d(0, 0, 0); opacity: .28; }
          50% { transform: translate3d(14px, -18px, 0); opacity: .52; }
        }

        @keyframes uploadFloatB {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(-3deg); opacity: .18; }
          50% { transform: translate3d(-18px, 12px, 0) rotate(3deg); opacity: .34; }
        }

        @keyframes filePulse {
          0%, 100% { opacity: .12; }
          50% { opacity: .36; }
        }

        @keyframes branchDraw {
          0% { stroke-dashoffset: 700; opacity: .05; }
          30% { opacity: .32; }
          70%, 100% { stroke-dashoffset: 0; opacity: .10; }
        }

        @keyframes scanLine {
          0% { transform: translateY(-260px); opacity: 0; }
          15% { opacity: .20; }
          50% { opacity: .10; }
          100% { transform: translateY(520px); opacity: 0; }
        }

        @keyframes uploadOrbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes uploadOrbitReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes uploadSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes uploadBlink {
          0%, 100% { opacity: .35; }
          50% { opacity: 1; }
        }

        @keyframes uploadButtonGlow {
          0%, 100% { box-shadow: 0 0 0 rgba(207, 218, 222, 0); }
          50% { box-shadow: 0 0 32px rgba(190, 204, 210, .10); }
        }

        .upload-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 50% 28%, rgba(115, 130, 138, .055), transparent 30%),
            radial-gradient(circle at 88% 66%, rgba(151, 166, 172, .035), transparent 28%),
            #06090b;
          color: #e8edef;
          font-family: "Arial", sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        .upload-page * {
          box-sizing: border-box;
        }

        .upload-grid {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: .42;
          background-image:
            linear-gradient(rgba(151, 163, 168, .055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(151, 163, 168, .055) 1px, transparent 1px);
          background-size: 58px 58px;
          mask-image: linear-gradient(to bottom, black 0%, rgba(0,0,0,.75) 70%, transparent 100%);
        }

        .upload-scan {
          position: fixed;
          left: 0;
          top: 198px;
          width: 100%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(218, 226, 229, .15),
            transparent
          );
          animation: scanLine 11s linear infinite;
          pointer-events: none;
        }

        .upload-network {
          position: fixed;
          inset: 76px 0 0;
          pointer-events: none;
          overflow: hidden;
        }

        .upload-network svg {
          width: 100%;
          height: 100%;
          min-width: 1000px;
          min-height: 800px;
        }

        .network-path {
          fill: none;
          stroke: #aeb9bd;
          stroke-width: 1.15;
          stroke-dasharray: 7 10;
          stroke-linecap: round;
          animation: branchDraw 15s ease-in-out infinite alternate;
        }

        .network-path.solid {
          stroke-dasharray: none;
          opacity: .14;
        }

        .network-node {
          fill: #d4dcdf;
          filter: drop-shadow(0 0 7px rgba(210, 220, 224, .35));
        }

        .network-node.dim {
          opacity: .35;
        }

        .network-label {
          fill: #8e9ba0;
          font-size: 9px;
          letter-spacing: 3px;
          font-family: monospace;
        }

        .network-file {
          fill: #aeb8bc;
          opacity: .18;
          animation: filePulse 5s ease-in-out infinite;
        }

        .network-folder {
          fill: none;
          stroke: #b4bec2;
          stroke-width: 1;
          opacity: .16;
        }

        .background-zip {
          position: absolute;
          width: 430px;
          height: 300px;
          object-fit: contain;
          right: -70px;
          top: 270px;
          opacity: .035;
          filter: invert(1) grayscale(1);
          mix-blend-mode: screen;
          pointer-events: none;
        }

        .background-folder {
          position: absolute;
          width: 360px;
          height: 360px;
          object-fit: contain;
          left: -70px;
          bottom: 40px;
          opacity: .025;
          filter: invert(1) grayscale(1);
          mix-blend-mode: screen;
          pointer-events: none;
        }

        .upload-navbar {
          height: 78px;
          position: relative;
          z-index: 20;
          border-bottom: 1px solid rgba(150, 162, 168, .13);
          background: rgba(5, 8, 10, .84);
          backdrop-filter: blur(16px);
          display: flex;
          align-items: center;
          padding: 0 3.5%;
        }

        .upload-logo {
          width: 62px;
          height: 62px;
          object-fit: contain;
          cursor: pointer;
          display: block;
        }

        .upload-nav {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 38px;
        }

        .upload-nav-button {
          border: 0;
          background: transparent;
          color: #647278;
          padding: 8px 0;
          cursor: pointer;
          font-family: monospace;
          font-size: 11px;
          letter-spacing: 2.2px;
          transition: color .2s ease;
          white-space: nowrap;
        }

        .upload-nav-button:hover {
          color: #d8dfe1;
        }

        .upload-nav-button.active {
          color: #edf2f3;
        }

        .upload-nav-button.active::after {
          content: "";
          display: block;
          width: 34px;
          height: 1px;
          margin: 16px auto -17px;
          background: #cdd6d9;
        }

        .upload-right-nav {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .upload-connected {
          color: #7d8b90;
          font-family: monospace;
          font-size: 9px;
          letter-spacing: 2px;
        }

        .upload-connected-dot {
          display: inline-block;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #d9e0e2;
          margin-right: 8px;
          box-shadow: 0 0 9px rgba(220, 227, 229, .55);
          animation: uploadBlink 2.5s ease-in-out infinite;
        }

        .upload-profile {
          border: 1px solid rgba(169, 181, 186, .22);
          background: transparent;
          color: #b6c0c4;
          padding: 9px 15px;
          font-family: monospace;
          font-size: 10px;
          letter-spacing: 2px;
          cursor: pointer;
        }

        .upload-main {
          position: relative;
          z-index: 5;
          width: min(1180px, 92%);
          margin: 0 auto;
          padding: 35px 0 75px;
        }

        .upload-back {
          border: 0;
          background: transparent;
          color: #85959c;
          font-family: monospace;
          font-size: 14px;
          letter-spacing: 2px;
          cursor: pointer;
          padding: 10px 0;
          margin-bottom: 42px;
        }

        .upload-back:hover {
          color: #dce2e4;
        }

        .upload-hero {
          text-align: center;
          position: relative;
          margin-bottom: 34px;
        }

        .upload-hero-label {
          color: #91a0a5;
          font-family: monospace;
          font-size: 10px;
          letter-spacing: 3.5px;
          margin: 0 0 23px;
        }

        .upload-hero-label::before {
          content: "●";
          color: #cbd4d7;
          margin-right: 10px;
          font-size: 7px;
        }

        .upload-title {
          margin: 0;
          font-size: clamp(54px, 6vw, 82px);
          line-height: .96;
          font-weight: 300;
          letter-spacing: -4px;
          color: #eef2f3;
        }

        .upload-title-muted {
          color: #737d81;
        }

        .upload-description {
          width: min(650px, 90%);
          margin: 27px auto 0;
          color: #78858a;
          font-size: 15px;
          line-height: 1.75;
        }

        .upload-card {
          width: min(900px, 100%);
          margin: 0 auto;
          padding: 32px 35px 30px;
          background: rgba(10, 15, 18, .82);
          border: 1px solid rgba(151, 165, 171, .20);
          position: relative;
          box-shadow: 0 30px 80px rgba(0, 0, 0, .30);
          backdrop-filter: blur(13px);
        }

        .upload-card::before,
        .upload-card::after {
          content: "";
          position: absolute;
          width: 38px;
          height: 38px;
          pointer-events: none;
        }

        .upload-card::before {
          left: -1px;
          top: -1px;
          border-left: 1px solid #c6d0d3;
          border-top: 1px solid #c6d0d3;
        }

        .upload-card::after {
          right: -1px;
          bottom: -1px;
          border-right: 1px solid #c6d0d3;
          border-bottom: 1px solid #c6d0d3;
        }

        .upload-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 28px;
        }

        .upload-card-kicker {
          color: #748187;
          font-family: monospace;
          font-size: 9px;
          letter-spacing: 3px;
          margin: 0 0 10px;
        }

        .upload-card-title {
          margin: 0;
          color: #e0e6e8;
          font-size: 24px;
          font-weight: 400;
        }

        .upload-card-copy {
          margin: 7px 0 0;
          color: #66757b;
          font-size: 12px;
        }

        .upload-source {
          border: 1px solid rgba(151, 166, 172, .20);
          padding: 9px 12px;
          color: #8f9ca0;
          font-family: monospace;
          font-size: 9px;
          letter-spacing: 2px;
          white-space: nowrap;
        }

        .upload-source-dot {
          display: inline-block;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #c6d0d3;
          margin-right: 7px;
        }

        .upload-zone {
          min-height: 285px;
          border: 1px dashed rgba(157, 171, 176, .28);
          background:
            linear-gradient(rgba(160, 171, 175, .025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(160, 171, 175, .025) 1px, transparent 1px),
            rgba(5, 9, 11, .62);
          background-size: 34px 34px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: border-color .25s ease, background .25s ease;
        }

        .upload-zone::before {
          content: "";
          position: absolute;
          inset: 18px;
          border: 1px solid rgba(166, 177, 181, .045);
          pointer-events: none;
        }

        .upload-zone.dragging {
          border-color: rgba(218, 226, 228, .58);
          background-color: rgba(30, 37, 40, .48);
        }

        .upload-zone-orbit {
          position: absolute;
          width: 210px;
          height: 210px;
          border: 1px dashed rgba(178, 189, 193, .10);
          border-radius: 50%;
          animation: uploadOrbit 25s linear infinite;
        }

        .upload-zone-orbit::before,
        .upload-zone-orbit::after {
          content: "";
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #cfd7da;
          box-shadow: 0 0 12px rgba(210, 218, 221, .5);
        }

        .upload-zone-orbit::before {
          top: -3px;
          left: 50%;
        }

        .upload-zone-orbit::after {
          bottom: 24px;
          right: 7px;
        }

        .upload-center {
          position: relative;
          z-index: 2;
        }

        .upload-icon {
          width: 66px;
          height: 66px;
          border: 1px solid rgba(182, 193, 197, .27);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 19px;
          color: #dbe1e3;
          font-family: monospace;
          font-size: 24px;
          background: rgba(11, 16, 19, .78);
          box-shadow: 0 0 35px rgba(188, 199, 203, .06);
        }

        .upload-file-icon {
          width: 66px;
          height: 66px;
          border: 1px solid rgba(182, 193, 197, .35);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 19px;
          color: #dce3e5;
          font-family: monospace;
          font-size: 13px;
          letter-spacing: 2px;
          background: rgba(16, 21, 24, .85);
        }

        .upload-zone-title {
          margin: 0 0 9px;
          color: #dfe5e7;
          font-size: 18px;
          font-weight: 400;
          max-width: 650px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .upload-zone-copy {
          margin: 0;
          color: #68767b;
          font-size: 12px;
        }

        .upload-zone-hint {
          margin-top: 17px;
          border: 1px solid rgba(155, 168, 173, .16);
          padding: 6px 10px;
          color: #7b888d;
          font-family: monospace;
          font-size: 9px;
          letter-spacing: 1.5px;
        }

        .upload-change {
          margin-top: 15px;
          border: 0;
          background: transparent;
          color: #adb7ba;
          font-family: monospace;
          font-size: 10px;
          letter-spacing: 1px;
          cursor: pointer;
        }

        .upload-change:hover {
          color: #edf1f2;
        }

        .upload-error {
          margin-top: 13px;
          padding: 11px 13px;
          border: 1px solid rgba(184, 139, 139, .28);
          background: rgba(60, 27, 27, .25);
          color: #c9a6a6;
          font-family: monospace;
          font-size: 11px;
          letter-spacing: .3px;
        }

        .upload-submit {
          width: 100%;
          height: 55px;
          margin-top: 19px;
          border: 1px solid rgba(213, 222, 224, .65);
          background: #dce5e8;
          color: #111719;
          font-family: monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: transform .2s ease, background .2s ease;
          animation: uploadButtonGlow 4s ease-in-out infinite;
        }

        .upload-submit:hover:not(:disabled) {
          background: #edf2f3;
          transform: translateY(-1px);
        }

        .upload-submit:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .upload-spinner {
          width: 15px;
          height: 15px;
          border: 1px solid rgba(20, 26, 28, .25);
          border-top-color: #151b1d;
          border-radius: 50%;
          display: inline-block;
          animation: uploadSpin .8s linear infinite;
        }

        .upload-info-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          margin-top: 27px;
          border-top: 1px solid rgba(148, 162, 168, .13);
        }

        .upload-info-item {
          min-height: 65px;
          padding: 19px 22px 0;
          border-right: 1px solid rgba(148, 162, 168, .13);
          display: flex;
          gap: 13px;
          align-items: flex-start;
        }

        .upload-info-item:last-child {
          border-right: 0;
        }

        .upload-info-icon {
          color: #c1cbce;
          font-size: 18px;
          line-height: 1;
        }

        .upload-info-title {
          margin: 0 0 5px;
          color: #aeb9bd;
          font-size: 11px;
          font-weight: 400;
        }

        .upload-info-copy {
          margin: 0;
          color: #5f6d72;
          font-size: 10px;
          line-height: 1.5;
        }

        .upload-footer {
          width: min(1100px, 100%);
          margin: 28px auto 0;
          display: flex;
          justify-content: space-between;
          color: #465359;
          font-family: monospace;
          font-size: 8px;
          letter-spacing: 2px;
        }

        .upload-steps {
          width: min(900px, 100%);
          margin: 58px auto 0;
          padding-top: 25px;
          border-top: 1px solid rgba(148, 162, 168, .12);
        }

        .upload-steps-title {
          color: #a8b2b5;
          font-family: monospace;
          font-size: 10px;
          letter-spacing: 3px;
          text-align: center;
          margin: 0 0 25px;
        }

        .upload-step-grid {
          display: grid;
          grid-template-columns: 1fr 45px 1fr 45px 1fr;
          align-items: center;
        }

        .upload-step {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .upload-step-number {
          width: 34px;
          height: 34px;
          border: 1px solid rgba(158, 171, 176, .17);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ba7ab;
          font-family: monospace;
          font-size: 9px;
        }

        .upload-step-heading {
          margin: 0 0 5px;
          color: #aeb8bc;
          font-size: 12px;
          font-weight: 400;
        }

        .upload-step-text {
          margin: 0;
          color: #59666b;
          font-size: 10px;
          line-height: 1.5;
        }

        .upload-step-line {
          height: 1px;
          background: rgba(148, 162, 168, .15);
        }

        @media (max-width: 900px) {
          .upload-nav {
            gap: 18px;
          }

          .upload-navbar {
            padding: 0 20px;
          }

          .upload-main {
            width: 92%;
          }

          .background-zip {
            right: -150px;
            opacity: .02;
          }

          .background-folder {
            left: -150px;
            opacity: .015;
          }
        }

        @media (max-width: 720px) {
          .upload-navbar {
            height: 70px;
          }

          .upload-logo {
            width: 52px;
            height: 52px;
          }

          .upload-nav {
            display: none;
          }

          .upload-connected {
            display: none;
          }

          .upload-main {
            padding-top: 24px;
          }

          .upload-back {
            margin-bottom: 25px;
          }

          .upload-title {
            font-size: 48px;
            letter-spacing: -2.5px;
          }

          .upload-card {
            padding: 24px 18px;
          }

          .upload-card-top {
            flex-direction: column;
          }

          .upload-source {
            align-self: flex-start;
          }

          .upload-zone {
            min-height: 270px;
          }

          .upload-info-row {
            grid-template-columns: 1fr;
          }

          .upload-info-item {
            border-right: 0;
            border-bottom: 1px solid rgba(148, 162, 168, .13);
          }

          .upload-info-item:last-child {
            border-bottom: 0;
          }

          .upload-step-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .upload-step-line {
            display: none;
          }

          .upload-footer {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>

      {/* Background system */}
      <div className="upload-grid" />
      <div className="upload-scan" />

      <div className="upload-network" aria-hidden="true">
        <svg viewBox="0 0 1600 980" preserveAspectRatio="xMidYMid slice">
          {/* Left folder/file network */}
          <path
            className="network-path"
            d="M-50 180 C130 110 245 160 315 275 S410 475 570 410 S700 230 820 290"
          />
          <path
            className="network-path solid"
            d="M35 510 C190 455 230 560 330 625 S510 710 625 610"
          />
          <path
            className="network-path"
            d="M-30 760 C120 650 235 700 300 790 S470 900 615 800"
          />

          <circle className="network-node" cx="120" cy="145" r="6" />
          <circle className="network-node" cx="315" cy="275" r="5" />
          <circle className="network-node dim" cx="410" cy="475" r="4" />
          <circle className="network-node" cx="570" cy="410" r="6" />
          <circle className="network-node dim" cx="230" cy="560" r="4" />
          <circle className="network-node" cx="330" cy="625" r="6" />
          <circle className="network-node dim" cx="470" cy="900" r="5" />

          {/* Folder outlines */}
          <path
            className="network-folder"
            d="M70 225 h112 l24 23 h105 v96 H70z"
          />
          <path
            className="network-folder"
            d="M90 675 h125 l22 22 h120 v90 H90z"
          />

          <text className="network-label" x="82" y="215">
            SOURCE / FILES
          </text>
          <text className="network-label" x="92" y="665">
            PROJECT / ARCHIVE
          </text>

          {/* File icons */}
          <g className="network-file" transform="translate(155 270)">
            <path d="M0 0h28l11 11v37H0z" fill="none" stroke="#b9c3c6" />
            <path d="M28 0v13h11" fill="none" stroke="#b9c3c6" />
            <path d="M8 22h21M8 30h17M8 38h12" stroke="#b9c3c6" />
          </g>

          <g className="network-file" transform="translate(108 720)">
            <path d="M0 0h28l11 11v37H0z" fill="none" stroke="#b9c3c6" />
            <path d="M28 0v13h11" fill="none" stroke="#b9c3c6" />
            <path d="M8 22h21M8 30h17M8 38h12" stroke="#b9c3c6" />
          </g>

          {/* Right project archive network */}
          <path
            className="network-path"
            d="M1040 165 C1150 235 1220 160 1315 220 S1480 280 1660 190"
          />
          <path
            className="network-path solid"
            d="M970 455 C1080 390 1165 470 1250 520 S1450 570 1660 470"
          />
          <path
            className="network-path"
            d="M1010 760 C1140 670 1230 745 1320 820 S1500 870 1670 760"
          />

          <circle className="network-node" cx="1150" cy="235" r="5" />
          <circle className="network-node dim" cx="1315" cy="220" r="4" />
          <circle className="network-node" cx="1480" cy="280" r="6" />
          <circle className="network-node" cx="1080" cy="390" r="5" />
          <circle className="network-node dim" cx="1250" cy="520" r="4" />
          <circle className="network-node" cx="1450" cy="570" r="6" />
          <circle className="network-node dim" cx="1230" cy="745" r="5" />
          <circle className="network-node" cx="1500" cy="870" r="5" />

          {/* Right-side folder tree */}
          <g opacity=".22">
            <path d="M1375 105v300" stroke="#aeb9bd" strokeDasharray="2 8" />
            <text className="network-label" x="1400" y="125">PROJECT TREE</text>
            <text className="network-label" x="1400" y="160">▸ src/</text>
            <text className="network-label" x="1400" y="188">  ▸ components/</text>
            <text className="network-label" x="1400" y="216">  ▸ pages/</text>
            <text className="network-label" x="1400" y="244">  ▸ utils/</text>
            <text className="network-label" x="1400" y="272">  □ package.json</text>
            <text className="network-label" x="1400" y="300">  □ README.md</text>
          </g>
        </svg>

        {/* The two supplied ZIP visuals */}
        <img
          className="background-zip"
          src="/zip-logo.png"
          alt=""
          aria-hidden="true"
        />
        <img
          className="background-folder"
          src="/zip-folder.png"
          alt=""
          aria-hidden="true"
        />
      </div>

      {/* Navbar */}
      <nav className="upload-navbar">
        <img
          className="upload-logo"
          src="/knected-k-logo.png"
          alt="Knected"
          onClick={() => navigate("/dashboard")}
        />

        <div className="upload-nav">
          <button
            className="upload-nav-button"
            onClick={() => navigate("/dashboard")}
          >
            DASHBOARD
          </button>

          <button
            className="upload-nav-button"
            onClick={() => navigate("/recent-projects")}
          >
            RECENTS
          </button>

          <button
            className="upload-nav-button"
            onClick={() => navigate("/github-analysis")}
          >
            GITHUB
          </button>

          <button
            className="upload-nav-button active"
            onClick={() => navigate("/upload-project")}
          >
            UPLOAD
          </button>
        </div>

        <div className="upload-right-nav">
          <span className="upload-connected">
            <span className="upload-connected-dot" />
            KNECTED
          </span>

          <button
            className="upload-profile"
            onClick={() => navigate("/profile")}
          >
            PROFILE
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="upload-main">
        <button
          className="upload-back"
          onClick={() => navigate("/dashboard")}
        >
          ← BACK TO DASHBOARD
        </button>

        <section className="upload-hero">
          <p className="upload-hero-label">ZIP ARCHIVE // PROJECT SOURCE</p>

          <h1 className="upload-title">
            Upload your
            <br />
            <span className="upload-title-muted">project archive.</span>
          </h1>

          <p className="upload-description">
            Import a ZIP project and Knected will scan its files, map
            dependencies and prepare the source structure for an interactive
            visualization.
          </p>
        </section>

        <section className="upload-card">
          <div className="upload-card-top">
            <div>
              <p className="upload-card-kicker">[ LOCAL_SOURCE ]</p>
              <h2 className="upload-card-title">Project ZIP Archive</h2>
              <p className="upload-card-copy">
                Drop your project archive below to begin analysis.
              </p>
            </div>

            <div className="upload-source">
              <span className="upload-source-dot" />
              ZIP SOURCE
            </div>
          </div>

          <div
            className={`upload-zone ${dragging ? "dragging" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
            onClick={() => {
              if (!loading) {
                fileInputRef.current?.click();
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,application/zip"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />

            <div className="upload-zone-orbit" />

            <div className="upload-center">
              {!selectedFile ? (
                <>
                  <div className="upload-icon">↑</div>

                  <h2 className="upload-zone-title">
                    Drop your ZIP archive here
                  </h2>

                  <p className="upload-zone-copy">
                    or click anywhere to browse your files
                  </p>

                  <div className="upload-zone-hint">ZIP / PROJECT ARCHIVE</div>
                </>
              ) : (
                <>
                  <div className="upload-file-icon">ZIP</div>

                  <h2 className="upload-zone-title">
                    {selectedFile.name}
                  </h2>

                  <p className="upload-zone-copy">
                    {formatFileSize(selectedFile.size)}
                  </p>

                  <button
                    className="upload-change"
                    onClick={(e) => {
                      e.stopPropagation();

                      if (!loading) {
                        setSelectedFile(null);
                        setError("");
                      }
                    }}
                  >
                    CHANGE ARCHIVE
                  </button>
                </>
              )}
            </div>
          </div>

          {error && <div className="upload-error">[ ERROR ] {error}</div>}

          <button
            className="upload-submit"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="upload-spinner" />
                ANALYZING PROJECT...
              </>
            ) : (
              <>
                UPLOAD & ANALYZE
                <span>↗</span>
              </>
            )}
          </button>

          <div className="upload-info-row">
            <div className="upload-info-item">
              <span className="upload-info-icon">⌁</span>
              <div>
                <p className="upload-info-title">Local source</p>
                <p className="upload-info-copy">
                  Import your project as a ZIP archive.
                </p>
              </div>
            </div>

            <div className="upload-info-item">
              <span className="upload-info-icon">◇</span>
              <div>
                <p className="upload-info-title">Automatic analysis</p>
                <p className="upload-info-copy">
                  Scan files and resolve dependencies.
                </p>
              </div>
            </div>

            <div className="upload-info-item">
              <span className="upload-info-icon">⌘</span>
              <div>
                <p className="upload-info-title">Interactive graph</p>
                <p className="upload-info-copy">
                  Explore the resulting project structure.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="upload-steps">
          <p className="upload-steps-title">[ WHAT HAPPENS NEXT ]</p>

          <div className="upload-step-grid">
            <div className="upload-step">
              <div className="upload-step-number">01</div>
              <div>
                <h3 className="upload-step-heading">Upload</h3>
                <p className="upload-step-text">
                  Your ZIP archive is sent to Knected.
                </p>
              </div>
            </div>

            <div className="upload-step-line" />

            <div className="upload-step">
              <div className="upload-step-number">02</div>
              <div>
                <h3 className="upload-step-heading">Analyze</h3>
                <p className="upload-step-text">
                  Source files and dependencies are mapped.
                </p>
              </div>
            </div>

            <div className="upload-step-line" />

            <div className="upload-step">
              <div className="upload-step-number">03</div>
              <div>
                <h3 className="upload-step-heading">Visualize</h3>
                <p className="upload-step-text">
                  Explore your project's dependency structure.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="upload-footer">
          <span>KNECTED // CODE INTELLIGENCE</span>
          <span>LOCAL SOURCE // DEPENDENCY MAPPING</span>
        </div>
      </main>
    </div>
  );
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default UploadProject;
