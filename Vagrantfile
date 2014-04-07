# -*- mode: ruby -*-
# vi: set ft=ruby :

VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  config.vm.box = "hashicorp/precise64"

  # configure the frontend (hipache)
  config.vm.define "frontend" do |frontend|

    # configure networking
    frontend.vm.hostname = "frontend"
    frontend.vm.network "private_network", ip: "192.168.50.190"
    frontend.vm.network :forwarded_port, :host => 8888, :guest => 80

    # setup the box
    frontend.vm.provision "shell",
      path: "provisioner/frontend.sh"

    # run the docker registry on the frontend, just for the sake of simplicity
    # this would normally run on some dedicated instance in your infrastructure
    frontend.vm.provision "docker" do |d|
      d.run "registry",
        args: "-p 5000:5000 -v /opt/registry:/tmp/registry"
        #args: "-p 5000:5000"
    end      

  end

  # configure the backend (nginx)
  config.vm.define "backend" do |backend|

    # configure networking
    backend.vm.hostname = "backend"
    backend.vm.network "private_network", ip: "192.168.50.195"
    backend.vm.synced_folder ".", "/vagrant", type: "nfs"

    # setup the box
    backend.vm.provision "shell",
      path: "provisioner/backend.sh"

    # install docker and pull an ubuntu base image
    backend.vm.provision "docker",
      images: ["ubuntu"]

  end  

end
